from analysis.parser_python import parse_python_file
 
def test():
    features = parse_python_file(file_path='backend/tests/dummies/functions.py')

    assert len(features['functions']) > 0

    print('----- ----- -----')
    for feature, value in features.items():
        print(f'-- {feature}: {value}')

        
    
test()