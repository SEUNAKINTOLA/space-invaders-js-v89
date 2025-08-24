# syntax=docker/dockerfile:1.4
# Use multi-stage build for optimized production image

# -----------------------------
# Stage 1: Build dependencies
# -----------------------------
FROM python:3.11-slim-bullseye as builder

# Set build arguments and environment variables
ARG APP_USER=appuser
ARG APP_GROUP=appgroup
ARG APP_HOME=/app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    POETRY_VERSION=1.5.1

# Install system dependencies and security updates
RUN apt-get update && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y \
        curl \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir "poetry==${POETRY_VERSION}"

# Create non-root user
RUN groupadd -r ${APP_GROUP} && \
    useradd -r -g ${APP_GROUP} -d ${APP_HOME} ${APP_USER} && \
    mkdir -p ${APP_HOME} && \
    chown ${APP_USER}:${APP_GROUP} ${APP_HOME}

# Set working directory
WORKDIR ${APP_HOME}

# Copy dependency files
COPY --chown=${APP_USER}:${APP_GROUP} pyproject.toml poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# -----------------------------
# Stage 2: Production image
# -----------------------------
FROM python:3.11-slim-bullseye as production

# Set build arguments and environment variables
ARG APP_USER=appuser
ARG APP_GROUP=appgroup
ARG APP_HOME=/app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="${APP_HOME}/.local/bin:${PATH}"

# Install system dependencies and security updates
RUN apt-get update && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y \
        libpq5 \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN groupadd -r ${APP_GROUP} && \
    useradd -r -g ${APP_GROUP} -d ${APP_HOME} ${APP_USER} && \
    mkdir -p ${APP_HOME} && \
    chown ${APP_USER}:${APP_GROUP} ${APP_HOME}

# Set working directory
WORKDIR ${APP_HOME}

# Copy dependencies from builder
COPY --from=builder --chown=${APP_USER}:${APP_GROUP} /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder --chown=${APP_USER}:${APP_GROUP} /usr/local/bin /usr/local/bin

# Copy application code
COPY --chown=${APP_USER}:${APP_GROUP} . .

# Switch to non-root user
USER ${APP_USER}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set default command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "app.main:app"]

# Metadata labels
LABEL maintainer="Your Organization <maintainer@example.com>" \
      version="1.0" \
      description="Production Python application container" \
      org.opencontainers.image.source="https://github.com/your-org/your-repo"