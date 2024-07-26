# Dockerfile for FastAPI

# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code and .env file
COPY server/ ./
COPY server/.env ./

# Expose port 8000
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
