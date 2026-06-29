import os
import pytest
from analysis.parser_python import parse_python_file


def test_parse_python_file_extracts_function_features_correctly():
    """Assert that parse_python_file correctly extracts properties and metrics of functions in the dummy file."""
    # Arrange
    dummy_path = os.path.join("backend", "tests", "dummies", "functions.py")

    # Act
    features = parse_python_file(file_path=dummy_path)

    # Assert
    assert features is not None
    assert "functions" in features
    
    functions = features["functions"]
    # There should be 8 functions defined in backend/tests/dummies/functions.py
    assert len(functions) == 8

    # Index functions by name for easier assertions
    func_map = {f["name"]: f for f in functions}

    # Verify foo
    assert "foo" in func_map
    assert func_map["foo"]["features"].cyclomatic_complexity == 2
    assert func_map["foo"]["features"].max_nesting_depth == 1
    assert func_map["foo"]["features"].is_recursive is False
    assert "print" in func_map["foo"]["features"].unique_builtin_calls

    # Verify hello
    assert "hello" in func_map
    assert func_map["hello"]["features"].cyclomatic_complexity == 1
    assert func_map["hello"]["features"].max_nesting_depth == 0

    # Verify factorial
    assert "factorial" in func_map
    assert func_map["factorial"]["features"].cyclomatic_complexity == 2
    assert func_map["factorial"]["features"].is_recursive is True
    assert "len" in func_map["factorial"]["features"].unique_builtin_calls
    assert "sum" in func_map["factorial"]["features"].unique_builtin_calls

    # Verify nested_loops
    assert "nested_loops" in func_map
    assert func_map["nested_loops"]["features"].cyclomatic_complexity == 11
    assert func_map["nested_loops"]["features"].max_nesting_depth == 4
    assert func_map["nested_loops"]["features"].loop_count == 4
    assert func_map["nested_loops"]["features"].comprehension_count == 3


def test_parse_python_file_with_syntax_error(tmp_path):
    """Assert that parsing a Python file with a syntax error raises a SyntaxError."""
    # Arrange
    invalid_file = tmp_path / "invalid_syntax.py"
    invalid_file.write_text("def invalid_syntax(:\n    pass\n")

    # Act & Assert
    with pytest.raises(SyntaxError):
        parse_python_file(file_path=str(invalid_file))


def test_parse_python_file_with_valid_dynamic_code(tmp_path):
    """Assert that parse_python_file works correctly on a dynamically created valid file."""
    # Arrange
    valid_file = tmp_path / "valid_code.py"
    valid_file.write_text("def simple_func():\n    return 42\n")

    # Act
    features = parse_python_file(file_path=str(valid_file))

    # Assert
    assert features is not None
    assert len(features["functions"]) == 1
    assert features["functions"][0]["name"] == "simple_func"
    assert features["functions"][0]["features"].cyclomatic_complexity == 1