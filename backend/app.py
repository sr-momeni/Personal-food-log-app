"""
Flask backend for the Personal Food Log App.

This service accepts meal photos uploaded from the React frontend, stores them
in Amazon S3, runs the local machine-learning predictor, persists a summary in
SQLite, and exposes an API for retrieving historical entries. The design keeps
state in external systems (SQLite/S3) so it can scale across cloud runtimes
such as AWS Elastic Beanstalk or Lambda.
"""

from __future__ import annotations

import io
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from api.ml_predict import predict_calories

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "food_history.db"

load_dotenv(BASE_DIR.parent / ".env")


def _get_db_connection() -> sqlite3.Connection:
  """Return a SQLite connection with row access by name."""
  conn = sqlite3.connect(DB_PATH)
  conn.row_factory = sqlite3.Row
  return conn


def _initialise_database() -> None:
  """Create the history table if it does not yet exist."""
  conn = _get_db_connection()
  with conn:
    conn.execute(
      """
      CREATE TABLE IF NOT EXISTS food_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        food TEXT,
        calories INTEGER,
        created_at TEXT NOT NULL
      )
      """
    )
  conn.close()


def _build_s3_client():
  """Create an S3 client using environment credentials."""
  kwargs = {
    "service_name": "s3",
    "region_name": os.environ.get("AWS_REGION"),
  }
  if os.environ.get("AWS_ACCESS_KEY_ID") and os.environ.get("AWS_SECRET_ACCESS_KEY"):
    kwargs.update(
      aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
      aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    )
  return boto3.client(**kwargs)


def _upload_to_s3(s3_client, bucket: str, file_stream: io.BytesIO, filename: str) -> str:
  """
  Upload the bytes to S3 and return the public URL.

  Storage is delegated to S3 so the Flask server remains stateless and can
  scale horizontally without local disk dependencies.
  """
  file_stream.seek(0)
  extra_args = {"ContentType": "image/jpeg", "ACL": "public-read"}
  s3_client.upload_fileobj(file_stream, bucket, filename, ExtraArgs=extra_args)
  return f"https://{bucket}.s3.amazonaws.com/{filename}"


def _normalise_prediction(raw: Dict[str, object]) -> Tuple[str, int, List[str], Dict[str, int]]:
  """
  Ensure the predictor output contains the fields required by the API.

  The ML module currently returns at minimum a `food` label and a calorie
  estimate. We augment this with placeholder ingredients and macro estimates
  when they are missing so the REST contract remains stable.
  """
  food_name = str(raw.get("food") or "Meal")
  calories = int(raw.get("calories") or 0)
  ingredients = raw.get("ingredients") or []
  if not isinstance(ingredients, list):
    ingredients = list(ingredients)

  nutrition = raw.get("nutrition_facts")
  if not isinstance(nutrition, dict):
    # Simple macro breakdown: assume 50% carbs, 25% protein, 25% fat by calories.
    carbs = round(calories * 0.5 / 4) if calories else 0
    protein = round(calories * 0.25 / 4) if calories else 0
    fat = round(calories * 0.25 / 9) if calories else 0
    nutrition = {
      "calories": calories,
      "carbohydrates": carbs,
      "proteins": protein,
      "fats": fat,
    }
  else:
    nutrition.setdefault("calories", calories)

  return food_name, calories, ingredients, nutrition


def create_app() -> Flask:
  """Instantiate the Flask application and register routes."""
  app = Flask(__name__)
  CORS(app, resources={r"/*": {"origins": "*"}})
  _initialise_database()

  s3_bucket = os.environ.get("AWS_BUCKET_NAME")
  if not s3_bucket:
    raise RuntimeError("AWS_BUCKET_NAME must be set in the environment.")

  s3_client = _build_s3_client()

  @app.route("/predict", methods=["POST"])
  def predict() -> Tuple[Dict[str, object], int]:
    """
    Handle image uploads, run ML prediction, and persist the result.

    Steps:
      1. Receive the multipart image from the frontend.
      2. Upload the raw bytes to S3 for durable storage.
      3. Pass a temporary local copy to the ML predictor.
      4. Store a summary record in SQLite.
      5. Return a JSON payload consumable by the React application.
    """
    upload_key = "photo" if "photo" in request.files else "image"
    uploaded_file = request.files.get(upload_key)
    if uploaded_file is None or uploaded_file.filename == "":
      return {"error": "No image provided"}, 400

    file_bytes = io.BytesIO(uploaded_file.read())
    unique_name = f"{uuid.uuid4().hex}.jpg"

    try:
      image_url = _upload_to_s3(s3_client, s3_bucket, file_bytes, unique_name)
    except (BotoCoreError, NoCredentialsError) as exc:
      app.logger.exception("S3 upload failed: %s", exc)
      return {"error": "Cloud upload failed", "details": str(exc)}, 502

    # Persist bytes locally for the ML API (temporary file path).
    temp_path = BASE_DIR / "tmp"
    temp_path.mkdir(exist_ok=True)
    local_file = temp_path / unique_name
    with open(local_file, "wb") as temp_fp:
      temp_fp.write(file_bytes.getbuffer())

    try:
      raw_prediction = predict_calories(str(local_file))
    except Exception as exc:  # pragma: no cover
      app.logger.exception("Prediction failed: %s", exc)
      return {"error": "Prediction failed", "details": str(exc)}, 500
    finally:
      if local_file.exists():
        local_file.unlink(missing_ok=True)

    food_name, calories, ingredients, nutrition = _normalise_prediction(raw_prediction)

    created_at = datetime.now(timezone.utc).isoformat()
    conn = _get_db_connection()
    with conn:
      conn.execute(
        """
        INSERT INTO food_history (image_url, food, calories, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (image_url, food_name, calories, created_at),
      )
    conn.close()

    payload = {
      "image_url": image_url,
      "ingredients": ingredients,
      "nutrition_facts": nutrition,
      "timestamp": created_at,
    }
    return payload, 200

  @app.route("/history", methods=["GET"])
  def history() -> Tuple[Dict[str, List[Dict[str, object]]], int]:
    """Return stored prediction history ordered from newest to oldest."""
    conn = _get_db_connection()
    rows = conn.execute(
      """
      SELECT id, image_url, food, calories, created_at
      FROM food_history
      ORDER BY datetime(created_at) DESC
      """
    ).fetchall()
    conn.close()

    results = [
      {
        "id": row["id"],
        "image_url": row["image_url"],
        "food": row["food"],
        "calories": row["calories"],
        "created_at": row["created_at"],
      }
      for row in rows
    ]
    return {"items": results}, 200

  @app.route("/health", methods=["GET"])
  def health() -> Tuple[Dict[str, str], int]:
    """Simple health-check endpoint."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}, 200

  return app


if __name__ == "__main__":
  flask_app = create_app()
  flask_app.run(host="0.0.0.0", port=5000, debug=True)
