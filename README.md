# Code Complexity Analyzer

A developer tool that parses Python source code into an Abstract Syntax Tree,
computes cyclomatic complexity and Halstead metrics per function, predicts
Big-O time complexity using a trained ML classifier, and returns an interactive
call graph colored by hotspot severity.

---

## Quick start

### Option A — Local (recommended for development)

**Prerequisites:** Python 3.10 or higher, pip

```bash
# 1. Clone
git clone https://github.com/FrinceNacion/code-complexity-analyzer.git
cd code-complexity-analyzer

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
make install
# or: pip install -r backend/requirements.txt

# 4. Start the API server
make run
# or: cd backend && uvicorn main:app --reload

# 5. Verify it's running
curl http://localhost:8000/api/health # -- not implemented yet
```

### Option B — Docker

**Prerequisites:** Docker and Docker Compose

```bash
git clone https://github.com/FrinceNacion/code-complexity-analyzer.git
cd code-complexity-analyzer

docker compose up --build
# API available at http://localhost:8000
```

---

## Environment variables

All variables have working defaults. No `.env` file is required to run locally.

Copy `.env.example` to `.env` to override any value:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | API server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `MODEL_PATH` | *(auto)* | Override path to `model.pkl` |

---

## ML model

The Big-O classifier requires a trained model. The pre-trained `model.pkl`
is **not committed to the repository** (binary files bloat git history).

To train the model locally:

```bash
make train
# or: cd backend && python -m ml.train
```

Training takes under 30 seconds. The model is saved to
`backend/ml/model/model.pkl`. The API starts cleanly without it — Big-O
fields will be `null` in responses until the model is trained.

---

## Usage

### Analyze a file via CLI

```bash
# table output
cd backend
python -m analysis.analysis path/to/your_file.py

# JSON output
python -m analysis.analysis path/to/your_file.py --json
```

### Analyze a file via API

```bash
curl -F "file=@your_file.py" http://localhost:8000/api/analyze
```

### API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and version |
| `POST` | `/api/analyze` | Analyze a `.py` file upload |

Full interactive API docs available at `http://localhost:8000/docs` when
the server is running.

---

## Development commands

```bash
make install      # install dependencies
make run          # start API with hot reload
make test         # run full test suite
make train        # train Big-O ML model
make lint         # run flake8
make docker-up    # start with Docker Compose
make clean        # remove __pycache__ and .pyc files
```

---

## Running tests

```bash
make test
# or: cd backend && pytest tests/ -v
```

All tests are in `backend/tests/`. The suite covers the AST parser,
complexity metrics, call graph builder, ML feature extraction, ML
prediction, and API endpoints.

---

## Project structure

```
code-complexity-analyzer/
├── backend/
│   ├── analysis/
│   │   ├── analysis.py          # CLI entry point
│   │   ├── call_graph.py        # call graph builder
│   │   ├── complexity_visitor.py # AST walker
│   │   ├── constants.py         # shared constants
│   │   ├── feature_extractor.py # Halstead + complexity metrics
│   │   ├── models.py            # Pydantic schemas
│   │   └── parser_python.py     # file parser
│   ├── ml/
│   │   ├── features.py          # ML feature vector
│   │   ├── predict.py           # inference wrapper
│   │   ├── train.py             # training pipeline
│   │   ├── constants.py         # model and data paths
│   │   └── data/snippets.csv    # labeled training data
│   ├── routers/
│   │   └── analyze.py           # POST /api/analyze
│   ├── tests/                   # pytest test suite
│   ├── main.py                  # FastAPI app entry point
│   └── requirements.txt
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── Makefile
└── pyproject.toml
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Analysis engine | Python `ast` stdlib, NetworkX |
| ML pipeline | scikit-learn (Random Forest), pandas, joblib |
| API | FastAPI, uvicorn, Pydantic |
| Testing | pytest, pytest-asyncio, httpx |
| Frontend *(Phase 4)* | React, Vite, D3.js |

---

## License

MIT — see [LICENSE](LICENSE)R