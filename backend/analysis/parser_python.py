import os
import ast
from analysis.complexity_visitor import ComplexityVisitor

def parse_python_file(file_path: str):
    if not (os.path.exists(file_path)):
        print('path doesnt exists')
        return

    if not (os.path.isfile(file_path)):
        print('path not file')
        return
    
    file =  open(file=file_path, mode='r', encoding='utf-8')

    tree = ast.parse(file.read())
    visitor = ComplexityVisitor()
    visitor.visit(tree)

    complexity = visitor.complexity
    max_depth = visitor.max_depth
    functions = visitor.functions
    
    return {
        'complexity': complexity,
        'max_depth': max_depth,
        'functions': functions
    }