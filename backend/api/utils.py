import uuid
from pathlib import Path

from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp"}


def allowed_file(filename: str) -> bool:
  return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(upload_folder: str, file_storage) -> str:
  upload_path = Path(upload_folder)
  upload_path.mkdir(parents=True, exist_ok=True)

  filename = secure_filename(file_storage.filename)
  extension = Path(filename).suffix or ".jpg"
  unique_name = f"meal_{uuid.uuid4().hex}{extension.lower()}"
  file_path = upload_path / unique_name
  file_storage.save(file_path)
  return str(file_path)
