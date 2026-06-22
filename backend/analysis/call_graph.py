from analysis.parser_python import parse_python_file
import builtins

def build_graph(features: dict[str,object]):
    if not len(features.get('functions')) > 0:
        return 'no functions'
    
    graph = {}
    nodes = []
    edges = []

    for function in features.get('functions'):
        node = {'label': function.get('name'), 'complexity': function.get('cyclomatic_complexity')}
        nodes.append(node)

    for edge in features.get('call_edges'):
        if edge['callee'] in builtins.__dict__.keys():
            continue
        node_edge = {'source': edge['caller'], 'target': edge['callee']}
        edges.append(node_edge)
    
    graph['nodes'] = nodes
    graph['edges'] = edges

    return graph