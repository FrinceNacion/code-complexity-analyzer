import os
from analysis.models import ExtractedFeatures
from ml.features import FEATURE_NAMES, to_vector
from ml.constants import model_path

_model = None
_serialized_feature_names = None

def _load_model():
    global _model, _serialized_feature_names
    if _model is not None:
        return

    if not os.path.exists(model_path):
        raise FileNotFoundError("model.pkl not found — run `python -m ml.train` first")

    import joblib

    try:
        data = joblib.load(model_path)
    except Exception as e:
        raise FileNotFoundError(f"model.pkl exists but failed to load — run `python -m ml.train` to retrain. Details: {e}")

    if not isinstance(data, dict) or "model" not in data or "feature_names" not in data:
        raise ValueError("model.pkl has invalid format, missing model or feature_names. Run `python -m ml.train` first")

    _model = data["model"]
    _serialized_feature_names = data["feature_names"]

    if _serialized_feature_names != FEATURE_NAMES:
        raise ValueError(
            f"Feature names mismatch! Serialized: {_serialized_feature_names}, Expected: {FEATURE_NAMES}"
        )

def predict_big_o(features: ExtractedFeatures) -> dict:
    _load_model()
    
    vector = to_vector(features)
    X = [vector]
    
    probability = _model.predict_proba(X)[0]
    label = _model.predict(X)[0]
    
    confidence = float(max(probability))
    
    return {
        "label": str(label),
        "confidence": round(confidence, 3)
    }
