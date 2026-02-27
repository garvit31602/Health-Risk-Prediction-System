import json
import os
import joblib

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# ==========================
# Load Feature Order
# ==========================

print("Loading feature order...")
with open("health-app/public/feature_order.json", "r") as f:
    feature_order = json.load(f)

num_features = len(feature_order)

# ==========================
# Load Trained Model
# ==========================

print("Loading trained model...")
pipeline = joblib.load("Heart_model.pkl")

# ==========================
# Convert to ONNX
# ==========================

print("Converting to ONNX...")

initial_type = [('float_input', FloatTensorType([None, num_features]))]

onnx_model = convert_sklearn(
    pipeline,
    initial_types=initial_type,
    target_opset=12,
    options={'zipmap': False}
)

onnx_path = "health-app/public/heart_model.onnx"

with open(onnx_path, "wb") as f:
    f.write(onnx_model.SerializeToString())

print(f"ONNX model saved to {onnx_path}")

file_size_mb = os.path.getsize(onnx_path) / (1024 * 1024)
print(f"Model size: {file_size_mb:.2f} MB")

print("Conversion complete.")