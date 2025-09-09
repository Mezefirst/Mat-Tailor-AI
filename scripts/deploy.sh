#!/bin/bash

# MatTailor AI Production Deployment Script
# This script deploys the MatTailor AI application in production mode

set -e

DOMAIN=${1:-"mattailor.com"}
ENV_FILE=${2:-".env"}

echo "🚀 Starting MatTailor AI Production Deployment..."
echo "Domain: $DOMAIN"
echo "Environment file: $ENV_FILE"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "Please create it from the template: cp backend/.env.example $ENV_FILE"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' $ENV_FILE | xargs)

# Validate required environment variables
required_vars=("SECRET_KEY" "DATABASE_URL" "REDIS_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create SSL certificates if they don't exist
if [ ! -f "./nginx/ssl/fullchain.pem" ]; then
    echo "🔒 Setting up SSL certificates..."
    ./scripts/setup-ssl.sh $DOMAIN
fi

# Build and deploy
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🔍 Performing health checks..."
if curl -f https://$DOMAIN/api/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f https://$DOMAIN > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Database migration
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python -c "
import asyncpg
import asyncio
import os

async def check_db():
    try:
        conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
        result = await conn.fetchrow('SELECT COUNT(*) FROM materials')
        await conn.close()
        print(f'Database connected. Materials count: {result[0]}')
    except Exception as e:
        print(f'Database error: {e}')

asyncio.run(check_db())
"

echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "Frontend: https://$DOMAIN"
echo "API: https://api.$DOMAIN"
echo "API Docs: https://api.$DOMAIN/docs"
echo "Monitoring: https://monitoring.$DOMAIN"
echo ""
echo "📊 View logs with:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔧 Manage services with:"
echo "docker-compose -f docker-compose.prod.yml [start|stop|restart|down]"