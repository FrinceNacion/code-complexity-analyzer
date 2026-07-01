import pytest
from ml.features import FEATURE_NAMES, to_vector, vector_from_code

def test_vector_length():
    """Assert vector length matches len(FEATURE_NAMES)."""
    code = """
def simple_func(x):
    return x + 1
"""
    vector = vector_from_code(code)
    assert len(vector) == len(FEATURE_NAMES)

def test_recursive_function_vector():
    """Assert recursive function produces 1.0 at the is_recursive index."""
    code = """
def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)
"""
    vector = vector_from_code(code)
    is_rec_idx = FEATURE_NAMES.index("is_recursive")
    assert vector[is_rec_idx] == 1.0

def test_loop_depth_comparison():
    """Assert a function with a nested double loop has a higher max_loop_depth value than a single-loop function."""
    single_loop = """
def single(n):
    total = 0
    for i in range(n):
        total += i
    return total
"""
    nested_loops = """
def nested(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total += i * j
    return total
"""
    vector_single = vector_from_code(single_loop)
    vector_nested = vector_from_code(nested_loops)
    
    depth_idx = FEATURE_NAMES.index("max_loop_depth")
    assert vector_nested[depth_idx] > vector_single[depth_idx]
    assert vector_single[depth_idx] == 1.0
    assert vector_nested[depth_idx] == 2.0
