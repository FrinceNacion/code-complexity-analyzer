import os
from analysis.parser_python import parse_python_file
from analysis.call_graph import build_graph

def analyze():
    path = input('Enter python file path: ')

    if not os.path.isabs(path):
        path = os.path.abspath(path)
        print(path)

    if not os.path.exists(path):
        print('path does not exist')
        return
    
    if not os.path.isfile(path):
        print('path not file')
        return

    features = parse_python_file(file_path=path)
    graph = build_graph(features)

    return [features, graph]