import os
import pytest
from analysis.parser_python import parse_python_file


def test_complexity_calculation_of_dummy_file():
    """Assert the calculated complexity metrics of the complexity dummy file match expectations."""
    # Arrange
    dummy_path = os.path.join("backend", "tests", "dummies", "complexity.py")

    # Act
    parsed = parse_python_file(file_path=dummy_path)

    # Assert
    assert parsed is not None
    assert parsed["cyclomatic_complexity"] == 16
    assert parsed["max_nesting_depth"] == 3
    assert parsed["max_loop_depth"] == 2
    assert parsed["loop_count"] == 3
    assert parsed["comprehension_count"] == 4
    assert parsed["is_recursive"] is False


def test_parse_python_file_returns_none_for_nonexistent_path():
    """Assert that parsing a non-existent file returns None."""
    # Arrange
    non_existent_path = "backend/tests/dummies/does_not_exist.py"

    # Act
    result = parse_python_file(file_path=non_existent_path)

    # Assert
    assert result is None


def test_parse_python_file_returns_none_for_directory_path():
    """Assert that trying to parse a directory returns None."""
    # Arrange
    directory_path = "backend/tests/dummies"

    # Act
    result = parse_python_file(file_path=directory_path)

    # Assert
    assert result is None