import os
import ast
from analysis.complexity_visitor import ComplexityVisitor
from analysis.feature_extractor import extract_features

def parse_python_file(file_path: str):
    if not (os.path.exists(file_path)):
        print('path doesnt exists')
        return

    if not (os.path.isfile(file_path)):
        print('path not file')
        return
    
    with open(file=file_path, mode='r', encoding='utf-8') as file:
        source = file.read()

    tree = ast.parse(source)
    visitor = ComplexityVisitor()
    visitor.visit(tree)

    functions = visitor.functions
   
    features = extract_features(visitor)
    
    return {
        'functions': functions,
        'features': features
    }