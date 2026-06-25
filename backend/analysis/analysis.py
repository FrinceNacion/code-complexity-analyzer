import os

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

    print('passed')
    
if __name__ == '__main__':
    analyze()