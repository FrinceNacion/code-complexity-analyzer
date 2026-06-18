import ast

class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        super().__init__()
        self.functions = []
        self.current_depth = 0
        self.max_depth = 0
        
    def enter_block(self):
        self.current_depth += 1
        self.max_depth = max(self.max_depth, self.current_depth)

    def exit_block(self):
        self.current_depth -= 1
        
    def visit_If(self, node):
        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_For(self, node):
        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_While(self, node):
        self.enter_block()
        self.generic_visit(node)
        self.exit_block()
    
    def visit_Try(self, node):
        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_Match(self, node):
        self.enter_block()
        self.generic_visit(node)
        self.exit_block()

    def visit_FunctionDef(self, node):
        function_visitor = ComplexityVisitor()

        for statement in node.body:
            function_visitor.visit(statement)

        self.functions.append({
            'name' : node.name,
            'line' : node.lineno
        })
        
        self.generic_visit(node)