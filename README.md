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
curl http://localhost:8000/health
```

### Option B — Docker

**Prerequisites:** Docker Desktop or Docker Engine + Docker Compose

```bash
git clone https://github.com/FrinceNacion/code-complexity-analyzer.git
cd code-complexity-analyzer

cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

Once running:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## Docker workflow

### Build and run

```bash
docker compose up --build
```

### Rebuild after dependency changes

```bash
docker compose build --no-cache
```

### Stop the stack

```bash
docker compose down
```

### View logs

```bash
docker compose logs -f backend
# or
# docker compose logs -f frontend
```

### Development notes

- Source files are bind-mounted into the containers, so edits on your host are reflected immediately in the running services.
- The frontend uses Vite dev server with hot reload.
- The backend uses Uvicorn reload mode for live code updates.

---

## Environment variables

Copy the example files to local overrides before starting Docker:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable | Default | Description |
|---|---|---|
| `BACKEND_PORT` | `8000` | Backend container port |
| `FRONTEND_PORT` | `5173` | Frontend container port |
| `CORS_ORIGIN` | `http://localhost:5173,...` | Allowed frontend origins |
| `BACKEND_ENVIRONMENT` | `development` | Switches between dev and prod startup |
| `VITE_API_PROXY_TARGET` | `http://backend:8000` | Address used by Vite for API proxying |

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
make docker-down  # stop the Docker stack
make clean        # remove __pycache__ and .pyc files
```

## Troubleshooting

- If the frontend cannot reach the API, verify that both containers are healthy and that the backend service name is reachable from the frontend container.
- On Windows, use Docker Desktop and ensure file sharing is enabled for the repository folder.
- If ports are already in use, override them in the `.env` file with different values for `BACKEND_PORT` and `FRONTEND_PORT`.
- If you see a permission issue on startup scripts, rebuild the image after ensuring the script has executable permissions.

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