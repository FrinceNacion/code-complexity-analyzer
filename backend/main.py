import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    logger.warning("python-dotenv not installed — environment variables will not be loaded from .env file")


def _get_cors_origins() -> list[str]:
    default_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://frontend:5173"]
    raw_origins = os.getenv("CORS_ORIGIN", "")
    if not raw_origins:
        return default_origins

    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

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

cors_origins = _get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "backend"}


@app.get("/api/health")
async def api_health_check() -> dict[str, str]:
    return {"status": "ok", "service": "backend"}

app.include_router(analyze.router, prefix="/api", tags=["analysis"])