from pathlib import Path

from flask import Flask
from flask_cors import CORS

from api.routes import api_bp
from database import db


def create_app():
  app = Flask(__name__)

  base_dir = Path(__file__).resolve().parent
  database_path = base_dir / "database" / "foodlog.db"
  uploads_path = base_dir / "uploads"
  uploads_path.mkdir(parents=True, exist_ok=True)

  app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{database_path}"
  app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
  app.config["UPLOAD_FOLDER"] = str(uploads_path)

  CORS(app, resources={r"/*": {"origins": "*"}})
  db.init_app(app)

  with app.app_context():
    from models.meal import Meal  # noqa: F401

    db.create_all()

  app.register_blueprint(api_bp, url_prefix="/api")

  @app.route("/test", methods=["GET"])
  def test_connection():
    return {"message": "Backend connected successfully"}, 200

  return app


if __name__ == "__main__":
  application = create_app()
  application.run(host="0.0.0.0", port=5000, debug=True)
