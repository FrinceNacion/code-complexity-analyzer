import math
from typing import TYPE_CHECKING
from analysis.models import ExtractedFeatures

if TYPE_CHECKING:
    from analysis.complexity_visitor import ComplexityVisitor

def extract_features(visitor: "ComplexityVisitor") -> dict:
    # n1 = Number of distinct operators.
    # n2 = Number of distinct operands. 
    # N1 = Total number of occurrences of operators. 
    # N2 = Total number of occurrences of operands.
    n1 = len(visitor.unique_operators)
    n2 = len(visitor.unique_operands)
    N1 = visitor.operator_counter
    N2 = visitor.operand_counter

    vocabulary = n1 + n2
    length = N1 + N2

    halstead_difficulty = (n1 / 2) * (N2 / n2) if n2 > 0 else 0
    halstead_volume = length * math.log2(vocabulary) if vocabulary > 0 else 0

    return ExtractedFeatures(
        cyclomatic_complexity= visitor.complexity, #
        if_count= visitor.if_count, #
        max_nesting_depth= visitor.max_depth, #
        max_loop_depth= visitor.max_loop_depth, #
        loop_count= visitor.loop_count, #
        comprehension_count= visitor.comprehension_count,
        is_recursive= visitor.is_recursive, #
        builtin_call_count= len(visitor.builtin_calls),
        unique_builtin_calls= sorted(list(set(visitor.builtin_calls))),
        halstead_vocabulary= vocabulary,
        halstead_length= length,
        halstead_difficulty= halstead_difficulty, #
        halstead_volume= halstead_volume, #
        call_edges= visitor.calls #
    )

    return {
        "cyclomatic_complexity": visitor.complexity,
        "max_nesting_depth": visitor.max_depth,
        "max_loop_depth": visitor.max_loop_depth,
        "loop_count": visitor.loop_count,
        "comprehension_count": visitor.comprehension_count,
        "is_recursive": visitor.is_recursive,
        "builtin_call_count": len(visitor.builtin_calls),
        "unique_builtin_calls": sorted(list(set(visitor.builtin_calls))),
        "halstead_vocabulary": vocabulary,
        "halstead_length": length,
        "halstead_difficulty": halstead_difficulty,
        "halstead_volume": halstead_volume,
        "call_edges": visitor.calls,
    }
