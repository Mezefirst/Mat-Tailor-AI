#!/bin/bash
# MatTailor AI Deployment Script

set -e

echo "🚀 MatTailor AI Deployment Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose v2."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Parse command line arguments
DEPLOYMENT_TYPE=${1:-"backend-only"}

case $DEPLOYMENT_TYPE in
    "backend-only"|"backend")
        echo "🔧 Starting backend-only deployment (API + Database + Redis)..."
        docker compose -f docker-compose.backend-only.yml down -v 2>/dev/null || true
        docker compose -f docker-compose.backend-only.yml build
        docker compose -f docker-compose.backend-only.yml up -d
        echo "✅ Backend services started!"
        echo ""
        echo "🌐 Available endpoints:"
        echo "  - API Health: http://localhost:8000/health"
        echo "  - API Docs: http://localhost:8000/docs"
        echo "  - API Root: http://localhost:8000/"
        ;;
    "dev"|"development")
        echo "🔧 Starting full development deployment..."
        docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker compose -f docker-compose.dev.yml build
        docker compose -f docker-compose.dev.yml up -d
        echo "✅ Development services started!"
        echo ""
        echo "🌐 Available endpoints:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - API: http://localhost:8000/docs"
        ;;
    "prod"|"production")
        echo "🔧 Starting production deployment..."
        docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        docker compose -f docker-compose.prod.yml build
        docker compose -f docker-compose.prod.yml up -d
        echo "✅ Production services started!"
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker compose -f docker-compose.backend-only.yml down -v 2>/dev/null || true
        docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        echo "✅ All services stopped!"
        ;;
    "help"|"--help"|"-h")
        echo "Usage: $0 [DEPLOYMENT_TYPE]"
        echo ""
        echo "Available deployment types:"
        echo "  backend-only  - Start only backend services (default)"
        echo "  dev           - Start full development environment"
        echo "  prod          - Start production environment"
        echo "  stop          - Stop all services"
        echo "  help          - Show this help message"
        ;;
    *)
        echo "❌ Unknown deployment type: $DEPLOYMENT_TYPE"
        echo "Run '$0 help' for available options."
        exit 1
        ;;
esac

if [ "$DEPLOYMENT_TYPE" != "stop" ] && [ "$DEPLOYMENT_TYPE" != "help" ]; then
    echo ""
    echo "📊 Service Status:"
    docker compose -f docker-compose.${DEPLOYMENT_TYPE}.yml ps 2>/dev/null || docker compose -f docker-compose.backend-only.yml ps
    
    echo ""
    echo "🔧 Useful commands:"
    echo "  View logs:    docker compose -f docker-compose.${DEPLOYMENT_TYPE}.yml logs -f"
    echo "  Stop services: $0 stop"
    echo "  Restart:      $0 $DEPLOYMENT_TYPE"
fi