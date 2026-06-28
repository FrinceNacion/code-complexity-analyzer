from pydantic import BaseModel, Field
from typing import Any
 
class GraphNode(BaseModel):
    label: str
    complexity: int = Field(ge=1, description="Cyclomatic complexity score")
 
class GraphEdge(BaseModel):
    source: str
    target: str
 
class CallGraph(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]

class ExtractedFeatures(BaseModel):
    cyclomatic_complexity: int = Field(ge=1)
    max_nesting_depth: int = Field(ge=0)
    max_loop_depth: int = Field(ge=0)
    loop_count: int = Field(ge=0)
    comprehension_count: int = Field(ge=0)
    is_recursive: bool
    builtin_call_count: int = Field(ge=0)
    unique_builtin_calls: list[str]
    halstead_vocabulary: int = Field(ge=0)
    halstead_length: int = Field(ge=0)
    halstead_difficulty: float = Field(ge=0)
    halstead_volume: float = Field(ge=0)
    call_edges: list[dict[str, Any]]
 
    @property
    def risk_level(self) -> str:
        complexity = self.cyclomatic_complexity
        if complexity <= 4:
            return "low"
        if complexity <= 7:
            return "medium"
        if complexity <= 10:
            return "high"
        return "critical"