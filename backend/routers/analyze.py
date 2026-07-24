import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
from analysis.parser_python import parse_python_file
from analysis.call_graph import build_graph
from analysis.models import (
    AnalysisResponse,
    AnalysisSummary,
    FunctionResponse,
    CallGraph,
)

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.2.0"}

MAX_FILE_SIZE = 500 * 1024  # 500 KB

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    if not (file.filename or "").endswith(".py"):
        raise HTTPException(
            status_code=400,
            detail=f"Only .py files are supported. Got: {file.filename}",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max size is 500 KB.",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    try:
        content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not valid UTF-8 text.")

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as tmp:
            tmp.write(content)
            temp_path = tmp.name

        parsed = parse_python_file(temp_path)

        if parsed is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse file.",
            )
    except SyntaxError as e:
        raise HTTPException(
            status_code=422,
            detail=f"File contains invalid Python syntax: {e}",
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

    graph_result = build_graph(parsed)
    if isinstance(graph_result, str): 
        graph = CallGraph(nodes=[], edges=[])
    else:
        graph = graph_result

    functions_raw = parsed.get("functions", [])
    try:
        from ml.predict import predict_big_o

        for function in functions_raw:
            prediction = predict_big_o(function["features"])
            function["big_o"] = prediction["label"]
            function["big_o_confidence"] = prediction["confidence"]
    except FileNotFoundError:
        for function in functions_raw:
            function["big_o"] = None
            function["big_o_confidence"] = None

    function_responses = [
        FunctionResponse(
            name=function["name"],
            line=function["line"],
            cyclomatic_complexity=function["features"].cyclomatic_complexity,
            max_nesting_depth=function["features"].max_nesting_depth,
            max_loop_depth=function["features"].max_loop_depth,
            loop_count=function["features"].loop_count,
            comprehension_count=function["features"].comprehension_count,
            is_recursive=function["features"].is_recursive,
            builtin_call_count=function["features"].builtin_call_count,
            unique_builtin_calls=function["features"].unique_builtin_calls,
            halstead_vocabulary=function["features"].halstead_vocabulary,
            halstead_length=function["features"].halstead_length,
            halstead_difficulty=function["features"].halstead_difficulty,
            halstead_volume=function["features"].halstead_volume,
            risk_level=function["features"].risk_level,
            big_o=function.get("big_o"),
            big_o_confidence=function.get("big_o_confidence"),
        )
        for function in functions_raw
    ]

    cyclomatic_scores = [function.cyclomatic_complexity for function in function_responses]
    summary = AnalysisSummary(
        total_functions=len(function_responses),
        avg_complexity=(
            round(sum(cyclomatic_scores) / len(cyclomatic_scores), 2) if cyclomatic_scores else 0.0
        ),
        max_complexity=max(cyclomatic_scores) if cyclomatic_scores else 0,
        hotspot_count=sum(1 for cyclomatic_complexity in cyclomatic_scores if cyclomatic_complexity > 10),
        language="python",
    )

    return AnalysisResponse(
        file_name=file.filename,
        summary=summary,
        file_features=parsed["features"],
        functions=function_responses,
        call_graph=graph,
    )
