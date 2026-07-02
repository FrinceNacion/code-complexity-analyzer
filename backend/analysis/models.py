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

class FunctionResponse(BaseModel):
    name: str
    line: int
    cyclomatic_complexity: int
    max_nesting_depth: int
    max_loop_depth: int
    loop_count: int
    comprehension_count: int
    is_recursive: bool
    builtin_call_count: int
    unique_builtin_calls: list[str]
    halstead_vocabulary: int
    halstead_length: int
    halstead_difficulty: float
    halstead_volume: float
    risk_level: str # "low" | "medium" | "high" | "critical"
    big_o: str | None
    big_o_confidence: float | None

class AnalysisSummary(BaseModel):
    total_functions: int
    avg_complexity: float
    max_complexity: int
    hotspot_count: int # functions with cyclomatic_complexity > 10
    language: str

class AnalysisResponse(BaseModel):
    file_name: str
    summary: AnalysisSummary
    file_features: ExtractedFeatures
    functions: list[FunctionResponse]
    call_graph: CallGraph