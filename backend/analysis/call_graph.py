from analysis.parser_python import parse_python_file
from analysis.constants import TRACKED_BUILTINS
from analysis.models import GraphEdge, GraphNode, CallGraph

def build_graph(features: dict[str,object]):
    if not len(features.get('functions')) > 0:
        return 'no functions'
    
    nodes = []
    edges = []

    for function in features.get('functions'):
        nodes.append(GraphNode(label=function.get('name'), complexity=function.get('features').cyclomatic_complexity))

    for edge in features.get('features').call_edges:
        if edge['callee'] in TRACKED_BUILTINS:
            continue
        edges.append(GraphEdge(source=edge['caller'] or '<module>', target=edge['callee']))

    return CallGraph(nodes=nodes, edges=edges)