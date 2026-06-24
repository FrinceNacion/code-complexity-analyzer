import os

def analyze():
    path = input('Enter python file path: ')

    if not os.path.exists(path):
        print('file does not exist')

    pass
    
if __name__ == '__main__':
    analyze()