# MatTailor AI Makefile
# Common Docker operations for development, test, and production

.PHONY: help dev test prod validate clean logs status

# Default target
help:
	@echo "MatTailor AI Docker Commands"
	@echo "============================"
	@echo "make dev        Start development environment"
	@echo "make test       Start test environment" 
	@echo "make prod       Start production environment (requires .env)"
	@echo "make validate   Validate deployment configuration"
	@echo "make logs       Show all service logs"
	@echo "make status     Show service status"
	@echo "make clean      Stop all services and clean up"
	@echo "make restart    Restart all services"

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	./scripts/deploy-dev.sh

# Test environment
test:
	@echo "🧪 Starting test environment..."
	./scripts/deploy-test.sh

# Production environment (requires .env file)
prod:
	@echo "🏭 Starting production environment..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found. Copy from .env.production and configure it."; \
		exit 1; \
	fi
	./scripts/deploy.sh localhost .env

# Validate configuration
validate:
	@echo "🔍 Validating deployment configuration..."
	./scripts/validate-deployment.sh

# Show logs
logs:
	@echo "📊 Showing service logs..."
	docker compose logs -f

# Show service status
status:
	@echo "📈 Service status:"
	docker compose ps

# Clean up (stop and remove containers)
clean:
	@echo "🧹 Cleaning up containers and networks..."
	docker compose -f docker-compose.yml down --volumes --remove-orphans || true
	docker compose -f docker-compose.test.yml down --volumes --remove-orphans || true
	docker compose -f docker-compose.prod.yml down --volumes --remove-orphans || true
	docker system prune -f

# Restart services
restart:
	@echo "🔄 Restarting services..."
	docker compose down
	docker compose up -d

# Build images
build:
	@echo "🏗️  Building Docker images..."
	docker compose build --no-cache

# Health check
health:
	@echo "🔍 Checking service health..."
	@echo "Backend health:"
	@curl -f http://localhost:8000/health 2>/dev/null && echo " ✅ Backend OK" || echo " ❌ Backend not responding"
	@echo "Frontend health:"
	@curl -f http://localhost:3000 2>/dev/null && echo " ✅ Frontend OK" || echo " ❌ Frontend not responding"