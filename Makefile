.PHONY: install run test train lint docker-build docker-up docker-down clean help

# Default target
help:
	@echo ""
	@echo "  Code complexity analyzer — available commands"
	@echo ""
	@echo "  make install      Install backend dependencies into active virtualenv"
	@echo "  make run          Start the API server with hot reload"
	@echo "  make test         Run the full test suite"
	@echo "  make train        Train the Big-O ML model"
	@echo "  make lint         Run flake8 on the backend"
	@echo "  make docker-build Build the Docker image"
	@echo "  make docker-up    Start the stack with docker compose"
	@echo "  make docker-down  Stop the stack"
	@echo "  make clean        Remove __pycache__ and .pyc files"
	@echo ""

install:
	pip install -r backend/requirements.txt

run:
	cd backend && uvicorn main:app --reload --host 0.0.0.0 --port $${PORT:-8000}

test:
	cd backend && pytest tests/ -v

train:
	cd backend && python -m ml.train

lint:
	cd backend && flake8 . --max-line-length=100 --exclude=__pycache__,tests/dummies

docker-build:
	docker build -t codelens-backend .

docker-up:
	docker compose up --build

docker-down:
	docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	find . -name "*.pyo" -delete 2>/dev/null || true