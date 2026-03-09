FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire app
COPY . .

# Set Python path to include root so backend package is findable
ENV PYTHONPATH=/app

# Command to run the application using the backend package
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8000", "--timeout", "120"]

# Run the app from backend directory
WORKDIR /app/backend
# Use sh -c to allow environment variable expansion
CMD ["sh", "-c", "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-8000} --timeout 120"]
