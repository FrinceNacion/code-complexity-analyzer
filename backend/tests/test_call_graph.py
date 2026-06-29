import pytest
from analysis.call_graph import build_graph
from analysis.models import CallGraph, GraphNode, GraphEdge, ExtractedFeatures


def test_build_graph_returns_no_functions_when_functions_list_is_empty():
    """Assert that build_graph returns the 'no functions' string when functions list is empty."""
    # Arrange
    features = {
        "functions": [],
        "call_edges": []
    }

    # Act
    result = build_graph(features)

    # Assert
    assert result == "no functions"


def test_build_graph_constructs_nodes_and_edges_excluding_builtins():
    """Assert that build_graph constructs valid node and edge mappings and excludes builtins from edge outputs."""
    # Arrange
    foo_features = ExtractedFeatures(
        cyclomatic_complexity=2,
        max_nesting_depth=0,
        max_loop_depth=0,
        loop_count=0,
        comprehension_count=0,
        is_recursive=False,
        builtin_call_count=0,
        unique_builtin_calls=[],
        halstead_vocabulary=0,
        halstead_length=0,
        halstead_difficulty=0.0,
        halstead_volume=0.0,
        call_edges=[]
    )
    bar_features = ExtractedFeatures(
        cyclomatic_complexity=3,
        max_nesting_depth=0,
        max_loop_depth=0,
        loop_count=0,
        comprehension_count=0,
        is_recursive=False,
        builtin_call_count=0,
        unique_builtin_calls=[],
        halstead_vocabulary=0,
        halstead_length=0,
        halstead_difficulty=0.0,
        halstead_volume=0.0,
        call_edges=[]
    )
    global_features = ExtractedFeatures(
        cyclomatic_complexity=5,
        max_nesting_depth=0,
        max_loop_depth=0,
        loop_count=0,
        comprehension_count=0,
        is_recursive=False,
        builtin_call_count=0,
        unique_builtin_calls=[],
        halstead_vocabulary=0,
        halstead_length=0,
        halstead_difficulty=0.0,
        halstead_volume=0.0,
        call_edges=[
            {"caller": "foo", "callee": "bar"},
            {"caller": "bar", "callee": "print"},  # builtin, should be excluded
            {"caller": "foo", "callee": "len"}     # builtin, should be excluded
        ]
    )
    features = {
        "functions": [
            {"name": "foo", "features": foo_features},
            {"name": "bar", "features": bar_features}
        ],
        "features": global_features
    }

    # Act
    graph = build_graph(features)

    # Assert
    assert isinstance(graph, CallGraph)

    # Verify nodes
    assert len(graph.nodes) == 2
    assert GraphNode(label="foo", complexity=2) in graph.nodes
    assert GraphNode(label="bar", complexity=3) in graph.nodes

    # Verify edges
    assert len(graph.edges) == 1
    assert graph.edges[0] == GraphEdge(source="foo", target="bar")


def test_build_graph_raises_type_error_when_functions_key_is_missing_or_none():
    """Assert that build_graph raises a TypeError when functions key is missing or is None."""
    # Arrange
    features_missing = {
        "call_edges": []
    }
    features_none = {
        "functions": None,
        "call_edges": []
    }

    # Act & Assert
    with pytest.raises(TypeError):
        build_graph(features_missing)

    with pytest.raises(TypeError):
        build_graph(features_none)
