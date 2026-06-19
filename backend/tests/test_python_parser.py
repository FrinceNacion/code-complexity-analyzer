from analysis.parser_python import parse_python_file
 
def test():
    parsed = parse_python_file(file_path='backend/tests/dummies/functions.py')

    print(parsed['functions'])

    for function in parsed['functions']:
        print(f'Name: {function['name']}')
        print(f'---- Line number: {function['line']}')
        print(f'---- Complexity: {function['complexity']}')
        print(f'---- Max depth: {function['max_depth']}\n')
        
    
test()