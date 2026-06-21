# dummy functions for python parser
def foo():
    for i in range(12):
        print(i)

def function(): foo()

def hello():
    pass

def greet(name: str) -> str:
    return f"Hello {name}"

def add(a: int, b: int = 0) -> int:
    return a + b

def process(items: list[str], count: int = 0):
    pass

def factorial(n):
    if n <= 1:
        return 1
    # call to factorial (recursive) and print (non-builtin/builtin depending on list)
    # len and sum are standard builtins we track
    val = len([1, 2])
    val2 = sum([n])
    return n * factorial(n - 1)

def nested_loops():
    total = 0
    # loop depth 1
    for i in range(10):
        # loop depth 2
        for j in range(5):
            # loop depth 3
            while total < 100:
                total += 1
        
    # comprehension
    squares = [x*x for x in range(10)]
    gen = (x for x in range(5))