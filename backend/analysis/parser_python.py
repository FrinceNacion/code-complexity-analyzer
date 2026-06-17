import os
import re
from pprint import pprint

MATCH_FUNCTION_PATTERN = re.compile(r"^def\s+(\w+)\s*\((.*?)\)\s*(?:->\s*([^:]+))?\s*:", re.MULTILINE)

def parse_python_file(file_path: str):
    if not (os.path.exists(file_path)):
        print('path doesnt exists')
        return

    if not (os.path.isfile(file_path)):
        print('path not file')
        return
    
    file =  open(file=file_path, mode='r', encoding='utf-8')
    functions = {}

    for line_number, line in enumerate(file, 1):
        match = re.search(MATCH_FUNCTION_PATTERN, line)
        if match: functions[line_number] = match.groups()
        
    file.close()

    if len(functions) == 0: 
        return

    print('line no# | function name')
    for line_number, function in functions.items():
        print(line_number, '       ' , function[0])
    
    #TODO: get function's nesting depth