import os
import pytest
from ml.predict import predict_big_o
from analysis.models import ExtractedFeatures

def get_dummy_features():
    return ExtractedFeatures(
        cyclomatic_complexity=1,
        max_nesting_depth=0,
        max_loop_depth=0,
        loop_count=0,
        comprehension_count=0,
        is_recursive=False,
        builtin_call_count=0,
        unique_builtin_calls=[],
        halstead_vocabulary=2,
        halstead_length=2,
        halstead_difficulty=0.5,
        halstead_volume=1.0,
        call_edges=[]
    )

def test_predict_big_o_returns_correct_shape():
    """Test that predict_big_o returns a dict with label and confidence when model is loaded."""
    features = get_dummy_features()
    result = predict_big_o(features)
    assert isinstance(result, dict)
    assert "label" in result
    assert "confidence" in result
    assert isinstance(result["label"], str)
    assert isinstance(result["confidence"], float)
    assert 0.0 <= result["confidence"] <= 1.0

def test_predict_file_not_found_error(monkeypatch):
    """Test that FileNotFoundError is raised with model.pkl temporarily missing."""
    import ml.predict

    # Reset global _model to force lazy loading retry
    monkeypatch.setattr(ml.predict, "_model", None)
    
    # Mock os.path.exists to simulate missing model.pkl
    original_exists = os.path.exists
    def mock_exists(path):
        if path.endswith("model.pkl"):
            return False
        return original_exists(path)
        
    monkeypatch.setattr(os.path, "exists", mock_exists)
    
    features = get_dummy_features()
    with pytest.raises(FileNotFoundError) as excinfo:
        predict_big_o(features)
        
    assert "model.pkl not found — run `python -m ml.train` first" in str(excinfo.value)
