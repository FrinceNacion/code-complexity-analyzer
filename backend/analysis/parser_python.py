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
    
    file =  open(file=file_path, mode='r', encoding='utf-8')

    tree = ast.parse(file.read())
    visitor = ComplexityVisitor()
    visitor.visit(tree)

    functions = visitor.functions
   
    features = extract_features(visitor)
    
    return {
        **features,
        'functions': functions,
        'call_edges': visitor.calls,
    }