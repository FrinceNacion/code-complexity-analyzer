from analysis.parser_python import parse_python_file
 
def test():
    functions = parse_python_file(file_path='backend/tests/dummy_functions.py')

    print('line no# | function name')
    for line_number, function in functions.items():
        print(line_number, '       ', function[0])

test()