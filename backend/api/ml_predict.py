"""Utilities for predicting meal information from uploaded images.

The module relies on a MobileNetV2 feature extractor combined with a downstream
classifier stored at ``models/food_svm.pkl``. When the classifier is missing or
libraries are unavailable, the functions fall back to returning random sample
predictions so the application remains responsive during development.
"""

import logging
import random
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
  import joblib
except ImportError:  # pragma: no cover
  joblib = None
  logger.warning("joblib is not installed. Using random predictions instead.")

try:
  from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
  )
  from tensorflow.keras.preprocessing.image import img_to_array, load_img
except ImportError:  # pragma: no cover
  MobileNetV2 = None
  preprocess_input = None
  img_to_array = None
  load_img = None
  logger.warning(
    "TensorFlow is not installed or misconfigured. Falling back to random predictions."
  )

# Cache heavy models so they load only once during the app lifecycle.
_FEATURE_EXTRACTOR: Optional[Any] = None
_CLASSIFIER: Optional[Any] = None
_CLASSIFIER_LOAD_ATTEMPTED = False

# Map classifier labels to user-friendly food names and calorie estimates.
LABEL_TO_MEAL: Dict[str, Dict[str, int]] = {
  "pasta": {"food": "Pasta with Tomato Sauce", "calories": 750},
  "salad": {"food": "Garden Salad", "calories": 320},
  "omelette": {"food": "Cheese Omelette", "calories": 400},
  "burger": {"food": "Beef Burger", "calories": 820},
  "sushi": {"food": "Salmon Sushi Roll", "calories": 410},
}


def _load_feature_extractor() -> Optional[Any]:
  """Return a MobileNetV2 model configured for feature extraction."""
  global _FEATURE_EXTRACTOR

  if _FEATURE_EXTRACTOR is not None:
    return _FEATURE_EXTRACTOR

  if MobileNetV2 is None:
    logger.warning("MobileNetV2 unavailable; skipping feature extraction.")
    return None

  logger.info("Loading MobileNetV2 feature extractor.")
  _FEATURE_EXTRACTOR = MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg",
  )
  return _FEATURE_EXTRACTOR


def _load_classifier() -> Optional[Any]:
  """Load the downstream SVM classifier if present on disk."""
  global _CLASSIFIER, _CLASSIFIER_LOAD_ATTEMPTED

  if _CLASSIFIER is not None or _CLASSIFIER_LOAD_ATTEMPTED:
    return _CLASSIFIER

  _CLASSIFIER_LOAD_ATTEMPTED = True

  if joblib is None:
    logger.warning("joblib unavailable; classifier cannot be loaded.")
    return None

  classifier_path = (
    Path(__file__).resolve().parent.parent / "models" / "food_svm.pkl"
  )
  if not classifier_path.exists():
    logger.warning(
      "Classifier file missing at %s. Falling back to random predictions.",
      classifier_path,
    )
    return None

  try:
    logger.info("Loading classifier from %s", classifier_path)
    _CLASSIFIER = joblib.load(classifier_path)
  except Exception as exc:  # pragma: no cover
    logger.exception("Failed to load classifier: %s", exc)
    _CLASSIFIER = None

  return _CLASSIFIER


def _prepare_image(image_path: str) -> Optional[np.ndarray]:
  """Load an image from disk and preprocess it for MobileNetV2."""
  if load_img is None or img_to_array is None or preprocess_input is None:
    logger.warning("TensorFlow image utilities unavailable; skipping inference.")
    return None

  image = load_img(image_path, target_size=(224, 224))
  image_array = img_to_array(image)
  image_array = np.expand_dims(image_array, axis=0)
  return preprocess_input(image_array)


def _random_prediction() -> Dict[str, int]:
  """Return a random meal entry as a graceful fallback."""
  label = random.choice(list(LABEL_TO_MEAL.keys()))
  return dict(LABEL_TO_MEAL[label])


def predict_calories(image_path: str) -> Dict[str, Any]:
  """Predict a meal label and calorie estimate for the provided image path."""
  try:
    feature_extractor = _load_feature_extractor()
    classifier = _load_classifier()

    if feature_extractor is None or classifier is None:
      logger.info("Falling back to random prediction due to missing models.")
      return _random_prediction()

    processed_image = _prepare_image(image_path)
    if processed_image is None:
      logger.info("Falling back to random prediction due to preprocessing error.")
      return _random_prediction()

    features = feature_extractor.predict(processed_image, verbose=0)
    raw_label = str(classifier.predict(features)[0])
    normalized_label = raw_label.lower()

    meal_info = LABEL_TO_MEAL.get(
      normalized_label,
      {"food": raw_label.replace("_", " ").title(), "calories": 450},
    )

    return {
      "food": meal_info["food"],
      "calories": int(meal_info["calories"]),
    }
  except Exception as exc:  # pragma: no cover
    logger.exception("Prediction failed: %s", exc)
    fallback = _random_prediction()
    fallback["error"] = str(exc)
    return fallback


if __name__ == "__main__":
  print(predict_calories("test.jpg"))
