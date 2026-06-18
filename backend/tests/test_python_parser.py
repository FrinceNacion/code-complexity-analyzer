from analysis.parser_python import parse_python_file
 
def test():
    parsed = parse_python_file(file_path='backend/tests/dummy_functions.py')

    print(parsed['functions'])
    
test()