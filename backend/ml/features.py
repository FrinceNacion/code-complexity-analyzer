import ast
from analysis.complexity_visitor import ComplexityVisitor
from analysis.feature_extractor import extract_features
from analysis.models import ExtractedFeatures

FEATURE_NAMES: list[str] = [
    "cyclomatic_complexity",
    "max_nesting_depth",
    "max_loop_depth",
    "loop_count",
    "comprehension_count",
    "is_recursive",
    "builtin_call_count",
    "halstead_difficulty",
    "halstead_volume",
]

def to_vector(features: ExtractedFeatures) -> list[float]:
    return [
        float(features.cyclomatic_complexity),
        float(features.max_nesting_depth),
        float(features.max_loop_depth),
        float(features.loop_count),
        float(features.comprehension_count),
        1.0 if features.is_recursive else 0.0,
        float(features.builtin_call_count),
        float(features.halstead_difficulty),
        float(features.halstead_volume),
    ]

def vector_from_code(code: str) -> list[float]:
    tree = ast.parse(code)
    visitor = ComplexityVisitor()
    visitor.visit(tree)
    features = extract_features(visitor)
    return to_vector(features)
