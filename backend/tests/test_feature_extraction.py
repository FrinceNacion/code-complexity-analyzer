import ast
from analysis.complexity_visitor import ComplexityVisitor
from analysis.feature_extractor import extract_features
from analysis.parser_python import parse_python_file

def test_recursive_and_builtins():
    code = """
    def factorial(n):
        if n <= 1:
            return 1
        # call to factorial (recursive) and print (non-builtin/builtin depending on list)
        # len and sum are standard builtins we track
        val = len([1, 2])
        val2 = sum([n])
        return n * factorial(n - 1)
    """
    tree = ast.parse(code)
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    
    features = extract_features(visitor)
    
    assert len(visitor.functions) == 1
    func_data = visitor.functions[0]
    
    assert func_data["is_recursive"] is True
    
    assert "len" in func_data["unique_builtin_calls"]
    assert "sum" in func_data["unique_builtin_calls"]
    assert func_data["builtin_call_count"] == 2
    
    callees = [edge["callee"] for edge in func_data["call_edges"]]
    assert "factorial" in callees
    assert "len" in callees
    assert "sum" in callees

def test_loop_depths_and_comprehensions():
    code = """
    def nested_loops():
        total = 0
        # loop depth 1
        for i in range(10):
            # loop depth 2
            for j in range(5):
                # loop depth 3
                while total < 100:
                    total += 1
        
        # comprehension
        squares = [x*x for x in range(10)]
        gen = (x for x in range(5))
    """
    tree = ast.parse(code)
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    
    assert len(visitor.functions) == 1
    func_data = visitor.functions[0]
    
    # loop count = 3 (for, for, while)
    assert func_data["loop_count"] == 3
    # max loop depth = 3
    assert func_data["max_loop_depth"] == 3
    # comprehension count = 2 (ListComp, GeneratorExp)
    assert func_data["comprehension_count"] == 2

def test_halstead_metrics():
    code = """
    a = 1 + 2
    b = a * 3
    """
    tree = ast.parse(code)
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    features = extract_features(visitor)
    
    # operators: Add, Mult
    assert "Add" in visitor.unique_operators
    assert "Mult" in visitor.unique_operators
    
    # operands: a, b, 1, 2, 3
    assert "a" in visitor.unique_operands
    assert "b" in visitor.unique_operands
    assert 1 in visitor.unique_operands
    assert 2 in visitor.unique_operands
    assert 3 in visitor.unique_operands

    assert features["halstead_vocabulary"] > 0
    assert features["halstead_length"] > 0
    assert features["halstead_difficulty"] > 0
    assert features["halstead_volume"] > 0

if __name__ == "__main__":
    test_recursive_and_builtins()
    test_loop_depths_and_comprehensions()
    test_halstead_metrics()
    print("All feature extraction tests passed successfully!")
