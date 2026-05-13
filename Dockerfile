FROM python:3.10-slim

# Non-root user for security
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Fix editable install for non-root
RUN pip install --no-cache-dir -e . && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Gunicorn: 2 workers, 120s timeout (embedding load is slow on cold start)
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
