from pydantic import BaseModel, Field
 
class GraphNode(BaseModel):
    label: str
    complexity: int = Field(ge=1, description="Cyclomatic complexity score")
 
class GraphEdge(BaseModel):
    source: str
    target: str
 
class CallGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]