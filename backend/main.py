import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from ml.predict import predict_big_o
        from analysis.models import ExtractedFeatures

        dummy = ExtractedFeatures(
            cyclomatic_complexity=1,
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
            call_edges=[],
        )
        predict_big_o(dummy)
        logger.info("model loaded successfully")
    except FileNotFoundError:
        logger.warning(
            "model.pkl not found — Big-O predictions will be unavailable. "
            "Run `python -m ml.train` to train the model."
        )
    yield  

app = FastAPI(
    title="Code Complexity Analyzer",
    description="Source code complexity analyzer",
    version="0.2.0",
    lifespan=lifespan,
)

cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["analysis"])