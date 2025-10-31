from datetime import datetime
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request

from api.ml_predict import predict_calories
from api.utils import allowed_file, save_uploaded_file
from database import db
from models.meal import Meal

api_bp = Blueprint("api", __name__)

TEST_USERS = {
  "momeni.salar@gmail.com": "1234",
  "test@example.com": "1234",
}

PROFILE_PAYLOAD = {
  "name": "Salar Momeni",
  "email": "momeni.salar@gmail.com",
  "age": 25,
  "weight": 72,
  "goal": "Maintain healthy weight",
}


@api_bp.route("/login", methods=["POST"])
def login():
  payload = request.get_json(silent=True) or {}
  raw_email = (payload.get("email") or "").strip()
  email = raw_email.lower()
  password = payload.get("password")

  if not email or not password:
    return jsonify({"error": "Email and password are required."}), 400

  expected_password = TEST_USERS.get(email)
  if expected_password and expected_password == password:
    return jsonify(
      {
        "token": "valid_token_123",
        "message": "Login successful",
        "email": raw_email or email,
      }
    ), 200

  return jsonify({"error": "Invalid credentials"}), 401


@api_bp.route("/profile", methods=["GET"])
def profile():
  return jsonify(PROFILE_PAYLOAD), 200


@api_bp.route("/upload", methods=["POST"])
def upload_image():
  if "image" not in request.files:
    return jsonify({"error": "No image provided"}), 400

  file = request.files["image"]
  if file.filename == "":
    return jsonify({"error": "Empty filename"}), 400

  if not allowed_file(file.filename):
    return jsonify({"error": "Unsupported file format"}), 400

  file_path = save_uploaded_file(current_app.config["UPLOAD_FOLDER"], file)
  stored_name = Path(file_path).name
  return jsonify(
    {
      "success": True,
      "filename": stored_name,
      "path": f"uploads/{stored_name}",
    }
  ), 200


@api_bp.route("/predict", methods=["POST"])
def predict():
  upload_key = "photo" if "photo" in request.files else "image"
  if upload_key not in request.files:
    return jsonify({"error": "No image provided"}), 400

  file = request.files[upload_key]
  if file.filename == "":
    return jsonify({"error": "Empty filename"}), 400

  if not allowed_file(file.filename):
    return jsonify({"error": "Unsupported file format"}), 400

  file_path = save_uploaded_file(current_app.config["UPLOAD_FOLDER"], file)
  try:
    prediction = predict_calories(file_path)
  except Exception as exc:  # pragma: no cover
    current_app.logger.exception("Meal prediction failed: {0}".format(exc))
    return jsonify({"error": "Prediction failed", "details": str(exc)}), 500

  return jsonify(prediction), 200


@api_bp.route("/meals", methods=["GET"])
def get_meals():
  meals = Meal.query.order_by(Meal.date.desc(), Meal.created_at.desc()).all()
  return jsonify([meal.to_dict() for meal in meals]), 200


@api_bp.route("/save_meal", methods=["POST"])
def save_meal():
  payload = request.get_json(silent=True) or {}
  name = payload.get("name")
  calories = payload.get("calories")
  date_str = payload.get("date")

  if not name or calories is None:
    return jsonify({"error": "Meal name and calories are required."}), 400

  try:
    calories_value = int(calories)
  except (TypeError, ValueError):
    return jsonify({"error": "Calories must be an integer."}), 400

  meal_date = None
  if date_str:
    try:
      meal_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
      return jsonify({"error": "Date must be in YYYY-MM-DD format."}), 400

  meal = Meal(
    name=name,
    calories=calories_value,
    date=meal_date or datetime.utcnow().date(),
  )
  db.session.add(meal)
  db.session.commit()

  return jsonify({"message": "Meal saved successfully", "meal": meal.to_dict()}), 201
