#!/bin/bash

# MatTailor AI Test Environment Deployment Script
# This script deploys the MatTailor AI application in test mode

set -e

ENV_FILE=${1:-".env.test"}

echo "🧪 Starting MatTailor AI Test Environment Deployment..."
echo "Environment file: $ENV_FILE"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "Please create it: cp .env.test $ENV_FILE"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

echo "✅ Environment variables loaded"

# Build and deploy
echo "🏗️  Building and starting test services..."
docker compose -f docker-compose.test.yml down
docker compose -f docker-compose.test.yml build --no-cache
docker compose -f docker-compose.test.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Health check
echo "🔍 Performing health checks..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    docker compose -f docker-compose.test.yml logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    docker compose -f docker-compose.test.yml logs frontend
    exit 1
fi

echo "🎉 Test deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "PostgreSQL: localhost:5433"
echo "Redis: localhost:6380"
echo ""
echo "📊 View logs with:"
echo "docker compose -f docker-compose.test.yml logs -f"
echo ""
echo "🔧 Manage services with:"
echo "docker compose -f docker-compose.test.yml [start|stop|restart|down]"