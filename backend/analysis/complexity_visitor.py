import ast

class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        super().__init__()
        self.functions = []

    def visit_FunctionDef(self, node):
        function_visitor = ComplexityVisitor()

        for statement in node.body:
            function_visitor.visit(statement)

        self.functions.append({
            'name' : node.name,
            'line' : node.lineno
        })
        
        self.generic_visit(node)