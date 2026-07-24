import io
import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient, ASGITransport

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

DUMMIES_DIR = os.path.join(os.path.dirname(__file__), "dummies")


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


def _py_file(content: bytes | str, filename: str = "test.py") -> dict:
    if isinstance(content, str):
        content = content.encode("utf-8")
    return {"file": (filename, io.BytesIO(content), "text/x-python")}


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_analyze_valid_python_file(client: AsyncClient):
    functions_py = os.path.join(DUMMIES_DIR, "functions.py")
    with open(functions_py, "rb") as f:
        content = f.read()

    response = await client.post("/api/analyze", files=_py_file(content, "functions.py"))
    assert response.status_code == 200

    body = response.json()

    # Summary assertions
    assert body["summary"]["total_functions"] == 8
    assert body["summary"]["language"] == "python"

    # Functions list
    assert isinstance(body["functions"], list)
    assert len(body["functions"]) > 0

    # Each function must have required fields
    for fn in body["functions"]:
        assert "name" in fn
        assert "cyclomatic_complexity" in fn
        assert "risk_level" in fn

    # Call graph shape
    assert "nodes" in body["call_graph"]
    assert "edges" in body["call_graph"]


@pytest.mark.asyncio
async def test_analyze_rejects_non_python_file(client: AsyncClient):
    response = await client.post(
        "/api/analyze",
        files={"file": ("readme.txt", io.BytesIO(b"hello world"), "text/plain")},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_analyze_rejects_empty_file(client: AsyncClient):
    response = await client.post("/api/analyze", files=_py_file(b"", "empty.py"))
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_analyze_rejects_oversized_file(client: AsyncClient):
    big_content = b"x = 1\n" * (600 * 1024 // 6 + 1)  # ~600 KB
    response = await client.post("/api/analyze", files=_py_file(big_content, "big.py"))
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_analyze_rejects_syntax_error_file(client: AsyncClient):
    bad_code = b"def invalid(:"
    response = await client.post("/api/analyze", files=_py_file(bad_code, "bad.py"))
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_analyze_no_functions_file(client: AsyncClient):
    no_funcs = b"x = 1 + 2\ny = x * 3\n"
    response = await client.post("/api/analyze", files=_py_file(no_funcs, "no_funcs.py"))
    assert response.status_code == 200

    body = response.json()
    assert body["summary"]["total_functions"] == 0
    assert body["call_graph"]["nodes"] == []
    assert body["call_graph"]["edges"] == []
