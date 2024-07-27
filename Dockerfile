# Stage 1: Build the React app
FROM node:16 AS build

# Set the working directory for React app
WORKDIR /app/client

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the React application
COPY client .

# Build the React application
RUN npm run build

# Stage 2: Set up the Python server environment
FROM python:3.9-slim AS server

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set the working directory for the server
WORKDIR /app

# Install Python dependencies
COPY server/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server application code
COPY server /app/

# Stage 3: Combine both Client and Server in a single image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Node.js and npm for serving the React app
RUN apt-get update && \
    apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install `serve` for serving the React app
RUN npm install -g serve

# Install Python dependencies
COPY server/requirements.txt /app/
RUN pip install --no-cache-dir -r /app/requirements.txt

# Set the working directory
WORKDIR /app

# Copy the server application code
COPY --from=server /app /app

# Copy the React build artifacts from the build stage
COPY --from=build /app/client/build /app/client/build

# Expose ports
EXPOSE 3000 8000

# Start both the React app and the Python server
CMD ["sh", "-c", "serve -s /app/client/build -l 3000 & uvicorn main:app --host 0.0.0.0 --port 8000"]
