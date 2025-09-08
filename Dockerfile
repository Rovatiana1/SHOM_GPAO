# Étape 1 - Builder l'application React
FROM node:18 as react-builder
WORKDIR /app/MONITORING
COPY MONITORING/package.json MONITORING/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY MONITORING/ .
RUN yarn build

# Étape 2 - Builder l'application Flask
FROM python:3.9-slim

WORKDIR /app

# Create non-root user and required directories
RUN useradd -m myuser && \
    mkdir -p /app/uploads/pdf /app/uploads/jpg /app/report && \
    chown -R myuser:myuser /app

# First copy requirements.txt alone for better caching
COPY --chown=myuser:myuser requirements.txt .

# Install system dependencies and Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get remove -y gcc python3-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copy remaining files
COPY --chown=myuser:myuser WEB_SERVICE/ WEB_SERVICE/
# COPY --chown=myuser:myuser --from=react-builder /app/build/ MONITORING/build/
COPY --chown=myuser:myuser start.sh .

# Set execute permissions
RUN chmod +x /app/start.sh

# Environment variables
ENV PYTHONPATH=/app
ENV FLASK_ENV=development

# Switch to non-root user
USER myuser

# Expose port
EXPOSE 5000

# Startup command
CMD ["./start.sh"]