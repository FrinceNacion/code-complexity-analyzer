import ast
import pytest
from analysis.complexity_visitor import ComplexityVisitor
from analysis.feature_extractor import extract_features


@pytest.fixture
def run_visitor():
    """A factory fixture that parses code, visits its AST nodes, and returns the visitor."""
    def _run(code_str: str) -> ComplexityVisitor:
        tree = ast.parse(code_str)
        visitor = ComplexityVisitor()
        visitor.visit(tree)
        return visitor
    return _run


def test_recursive_and_builtins_in_function_definition(run_visitor):
    """Assert that recursion detection and builtins extraction function correctly."""
    # Arrange
    code = """
def factorial(n):
    if n <= 1:
        return 1
    val = len([1, 2])
    val2 = sum([n])
    return n * factorial(n - 1)
"""

    # Act
    visitor = run_visitor(code)
    features = extract_features(visitor)

    # Assert
    assert len(visitor.functions) == 1
    func_data = visitor.functions[0]

    assert func_data["features"].is_recursive is True
    assert "len" in func_data["features"].unique_builtin_calls
    assert "sum" in func_data["features"].unique_builtin_calls
    assert func_data["features"].builtin_call_count == 2

    callees = [edge["callee"] for edge in func_data["features"].call_edges]
    assert "factorial" in callees
    assert "len" in callees
    assert "sum" in callees


def test_loop_depths_and_comprehensions_in_function(run_visitor):
    """Assert that loop counts, loop depths, and comprehensions are correctly counted and measured."""
    # Arrange
    code = """
def nested_loops():
    total = 0
    for i in range(10):
        for j in range(5):
            while total < 100:
                total += 1
        
    squares = [x*x for x in range(10)]
    gen = (x for x in range(5))
"""

    # Act
    visitor = run_visitor(code)

    # Assert
    assert len(visitor.functions) == 1
    func_data = visitor.functions[0]

    assert func_data["features"].loop_count == 3
    assert func_data["features"].max_loop_depth == 3
    assert func_data["features"].comprehension_count == 2


def test_halstead_metrics_for_basic_expressions(run_visitor):
    """Assert that operators and operands are correctly counted and Halstead metrics are non-zero."""
    # Arrange
    code = """
a = 1 + 2
b = a * 3
"""

    # Act
    visitor = run_visitor(code)
    features = extract_features(visitor)

    # Assert
    assert "Add" in visitor.unique_operators
    assert "Mult" in visitor.unique_operators

    assert "a" in visitor.unique_operands
    assert "b" in visitor.unique_operands
    assert 1 in visitor.unique_operands
    assert 2 in visitor.unique_operands
    assert 3 in visitor.unique_operands

    assert features.halstead_vocabulary == 7
    assert features.halstead_length == 8
    assert features.halstead_difficulty > 0
    assert features.halstead_volume > 0


def test_empty_input_produces_base_metrics(run_visitor):
    """Assert that parsing empty code results in baseline features and zero Halstead complexity."""
    # Arrange
    code = ""

    # Act
    visitor = run_visitor(code)
    features = extract_features(visitor)

    # Assert
    assert features.cyclomatic_complexity == 1
    assert features.max_nesting_depth == 0
    assert features.max_loop_depth == 0
    assert features.loop_count == 0
    assert features.comprehension_count == 0
    assert features.is_recursive is False
    assert features.builtin_call_count == 0
    assert features.halstead_vocabulary == 0
    assert features.halstead_length == 0
    assert features.halstead_difficulty == 0
    assert features.halstead_volume == 0


def test_try_except_blocks_increase_cyclomatic_complexity(run_visitor):
    """Assert that try-except blocks increase complexity based on handlers and except statements."""
    # Arrange
    code = """
def try_example():
    try:
        x = 1
    except ValueError:
        pass
    except TypeError:
        pass
"""

    # Act
    visitor = run_visitor(code)

    # Assert
    assert len(visitor.functions) == 1
    func_data = visitor.functions[0]
    # base complexity (1) + len(handlers) (2) + except nodes visited (2) = 5
    assert func_data["features"].cyclomatic_complexity == 5
