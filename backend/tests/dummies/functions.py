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
    val = len([1, 2])
    val2 = sum([n])
    return n * factorial(n - 1)

def nested_loops():
    total = 0
    for i in range(10):
        for j in range(5):
            # loop depth 3
            while total < 100:
                total += 1
                if i > j:
                    print(i)
                while i > j:
                    print(j)
        
    # comprehension
    squares = [x*x for x in range(10)]
    gen = (x for x in range(5) if x % 0 != 0)
    list = (x for x in range(14) if x % 0 != 0)