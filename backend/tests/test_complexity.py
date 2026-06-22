from analysis.parser_python import parse_python_file

def test():
    parsed = parse_python_file(file_path='backend/tests/dummies/complexity.py')

    assert len(parsed) > 0

    print(f'Cyclomatic complexity: {parsed['cyclomatic_complexity']}') 

test()