"""
Training script for the Food Log App demo classifier.

This script expects the following folder structure relative to this file:

backend/
├── dataset/
│   ├── Pasta/
│   ├── Salad/
│   └── Omelette/
└── train_model.py

Each class folder should contain JPEG/PNG images of the corresponding meal.
The script trains a lightweight classifier using transfer learning on
MobileNetV2, saves the model to ``models/food_cnn.h5`` and writes a simple
calorie mapping to ``models/calorie_mapping.json``.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Tuple

import tensorflow as tf

# Reproducibility
SEED = 42

IMG_SIZE: Tuple[int, int] = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10
CALORIE_MAPPING: Dict[str, int] = {
  "Pasta": 750,
  "Salad": 300,
  "Omelette": 400,
}


def ensure_dataset_exists(dataset_dir: Path) -> None:
  if not dataset_dir.exists():
    raise FileNotFoundError(
      f"Dataset directory not found at: {dataset_dir}\n"
      "Create the folder with subdirectories for each class "
      "(e.g. Pasta, Salad, Omelette) and populate them with images."
    )


def load_datasets(dataset_dir: Path):
  """Prepare TensorFlow datasets with an 80/20 train/validation split."""
  train_ds = tf.keras.utils.image_dataset_from_directory(
    dataset_dir,
    seed=SEED,
    validation_split=0.2,
    subset="training",
    label_mode="categorical",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
  )
  val_ds = tf.keras.utils.image_dataset_from_directory(
    dataset_dir,
    seed=SEED,
    validation_split=0.2,
    subset="validation",
    label_mode="categorical",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
  )
  return train_ds, val_ds


def build_model(num_classes: int) -> tf.keras.Model:
  """Create a transfer-learning model based on MobileNetV2."""
  base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
  )
  base_model.trainable = False  # Freeze base layers for the initial training.

  data_augmentation = tf.keras.Sequential(
    [
      tf.keras.layers.RandomFlip("horizontal"),
      tf.keras.layers.RandomRotation(0.1),
      tf.keras.layers.RandomZoom(0.1),
    ],
    name="data_augmentation",
  )

  inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
  x = data_augmentation(inputs)
  x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
  x = base_model(x, training=False)
  x = tf.keras.layers.GlobalAveragePooling2D()(x)
  x = tf.keras.layers.Dropout(0.2)(x)
  outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

  model = tf.keras.Model(inputs, outputs, name="food_classifier")
  model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
  )
  return model


def save_artifacts(model: tf.keras.Model, class_names, models_dir: Path) -> None:
  models_dir.mkdir(parents=True, exist_ok=True)
  model_path = models_dir / "food_cnn.h5"
  mapping_path = models_dir / "calorie_mapping.json"

  model.save(model_path)

  # Preserve the target calorie mapping, ensuring casing matches class names.
  mapping = {name: CALORIE_MAPPING.get(name, 450) for name in class_names}
  with mapping_path.open("w", encoding="utf-8") as fp:
    json.dump(mapping, fp, indent=2)

  print(f"Model saved to {model_path}")
  print(f"Calorie mapping saved to {mapping_path}")


def main() -> None:
  base_dir = Path(__file__).resolve().parent
  dataset_dir = base_dir / "dataset"
  models_dir = base_dir / "models"

  ensure_dataset_exists(dataset_dir)

  (train_ds, val_ds) = load_datasets(dataset_dir)
  class_names = train_ds.class_names
  print(f"Detected classes: {class_names}")

  AUTOTUNE = tf.data.AUTOTUNE
  train_ds = train_ds.shuffle(1000, seed=SEED).prefetch(AUTOTUNE)
  val_ds = val_ds.prefetch(AUTOTUNE)

  model = build_model(num_classes=len(class_names))
  model.summary()

  models_dir.mkdir(parents=True, exist_ok=True)

  callbacks = [
    tf.keras.callbacks.EarlyStopping(
      monitor="val_accuracy",
      patience=3,
      restore_best_weights=True,
    ),
    tf.keras.callbacks.ModelCheckpoint(
      filepath=models_dir / "food_cnn_best.h5",
      monitor="val_accuracy",
      save_best_only=True,
    ),
  ]

  history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks,
  )

  print("Training complete.")
  print(
    f"Best validation accuracy: {max(history.history.get('val_accuracy', [0])):.4f}"
  )

  save_artifacts(model, class_names, models_dir)


if __name__ == "__main__":
  main()
