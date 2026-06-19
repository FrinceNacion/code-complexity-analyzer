"""
    references
        cyclomatic complexity:
        - https://en.wikipedia.org/wiki/Cyclomatic_complexity
        - https://www.geeksforgeeks.org/dsa/cyclomatic-complexity/
        
        halstead metrics:
        - https://en.wikipedia.org/wiki/Halstead_complexity_measures
        - https://www.geeksforgeeks.org/software-engineering/software-engineering-halsteads-software-metrics/
"""
import ast

class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.complexity = 1 
        self.unique_operators = set()
        self.unique_operands = set()
        self.operator_counter = 0
        self.operand_counter = 0

        self.current_depth = 0
        self.max_depth = 0

        self.functions = []

    def enter_block(self):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)

    def exit_block(self):
        self.current_depth -= 1

    def visit_If(self, node):
        self.complexity += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_For(self, node):
        self.complexity += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_While(self, node):
        self.complexity += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_Try(self, node):
        self.complexity += len(node.handlers)

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_Match(self, node):
        self.complexity += len(node.cases)

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_ListComp(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_SetComp(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_DictComp(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_GeneratorExp(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        # if a and b and c
        self.complexity += len(node.values) - 1
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        func_visitor = ComplexityVisitor()

        for stmt in node.body:
            func_visitor.visit(stmt)

        self.functions.append({
            "name": node.name,
            "complexity": func_visitor.complexity,
            "max_depth": func_visitor.max_depth,
            "line": node.lineno
        })

        self.generic_visit(node)