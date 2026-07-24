FROM python:3.11-slim

WORKDIR /app

# Install dependencies (cached layer — only re-runs if requirements.txt changes)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY backend/ .

# Copy pre-trained model if it exists.
# If not present, the API starts without Big-O predictions.
# COPY backend/ml/model/model.pkl ml/model/model.pkl 2>/dev/null || true

EXPOSE ${PORT:-8000}

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}