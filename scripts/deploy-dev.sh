#!/bin/bash

# MatTailor AI Development Environment Deployment Script
# This script deploys the MatTailor AI application in development mode

set -e

ENV_FILE=${1:-".env.development"}

echo "🚀 Starting MatTailor AI Development Environment..."
echo "Environment file: $ENV_FILE"

# Check if environment file exists, create from template if not
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.development" ]; then
        cp .env.development "$ENV_FILE"
        echo "✅ Created $ENV_FILE from template"
    else
        echo "❌ Environment file $ENV_FILE not found and no template available!"
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

echo "✅ Environment variables loaded"

# Build and deploy
echo "🏗️  Starting development services..."
docker compose down 2>/dev/null || true
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🔍 Performing health checks..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend not ready yet (this is normal for development)"
fi

echo "🎉 Development environment started successfully!"
echo ""
echo "🌐 Application URLs:"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo ""
echo "📊 View logs with:"
echo "docker compose logs -f"
echo ""
echo "🔧 Manage services with:"
echo "docker compose [start|stop|restart|down]"