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

        self.calls = []
        self.is_recursive = False
        self.loop_depth = 0
        self.max_loop_depth = 0
        self.loop_count = 0
        self.comprehension_count = 0
        self.builtin_calls = []
        self.current_function = None
        self.functions = []

    def visit(self, node):
        if node is None:
            return
        
        if isinstance(node, (ast.operator, ast.unaryop, ast.boolop, ast.cmpop, ast.Compare)):
            self.unique_operators.add(node.__class__.__name__)
            self.operator_counter += 1
        elif isinstance(node, ast.Name):
            self.unique_operands.add(node.id)
            self.operand_counter += 1
        elif isinstance(node, ast.Constant):
            value = node.value
            try:
                hash(value)
                self.unique_operands.add(value)
            except TypeError:
                self.unique_operands.add(repr(value))
            self.operand_counter += 1

        return super().visit(node)

    def enter_block(self):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)

    def exit_block(self):
        self.current_depth -= 1

    def visit_If(self, node):
        self.complexity += 1
        self.unique_operators.add('if')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    # ternary if, example: result = "positive" if x > 0 else "negative"
    def visit_IfExp(self, node):
        self.complexity += 1
        self.unique_operators.add('if-ternary')
        self.operator_counter += 1

        # no enter/exit block since this is just a one-line statement
        self.generic_visit(node)

    def visit_For(self, node):
        self.complexity += 1
        self.unique_operators.add('for')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_AsyncFor(self, node):
        self.complexity += 1
        self.unique_operators.add('for')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_While(self, node):
        self.complexity += 1
        self.unique_operators.add('while')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_Try(self, node):
        self.complexity += len(node.handlers)
        self.unique_operators.add('try')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_Match(self, node):
        self.complexity += len(node.cases)
        self.unique_operators.add('match')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_ExceptHandler(self, node):
        self.complexity += 1
        self.unique_operators.add('except')
        self.operator_counter += 1

        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_comprehension(self, node):
        if len(node.ifs):
            self.complexity += len(node.ifs)
            self.unique_operators.add('if')
            self.operator_counter += len(node.ifs)

        if len([node.iter]):
            self.complexity += len([node.iter])
            self.unique_operators.add('for')
            self.operator_counter += len([node.iter])

        self.generic_visit(node)

    def visit_BoolOp(self, node):
        # if a and b and c
        self.complexity += len(node.values) - 1
        if isinstance(node.op, ast.And):
            self.unique_operators.add("and")
        elif isinstance(node.op, ast.Or):
            self.unique_operators.add("or")
        self.operator_counter += len(node.values) - 1
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        func_visitor = ComplexityVisitor()

        for stmt in node.body:
            func_visitor.visit(stmt)

        self.functions.append({
            "name": node.name,
            "body": node.body,
            "cyclomatic_complexity": func_visitor.complexity,
            "max_depth": func_visitor.max_depth,
            "line": node.lineno
        })

        self.generic_visit(node)