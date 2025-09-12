#!/bin/bash

# MatTailor AI Deployment Validation Script
# This script validates Docker deployment configurations without building images

set -e

echo "🔍 MatTailor AI Deployment Configuration Validation"
echo "================================================="

# Check Docker and Docker Compose
echo ""
echo "📋 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✅ Docker found: $(docker --version)"

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose v2 is not available"
    exit 1
fi
echo "✅ Docker Compose found: $(docker compose version)"

# Validate Docker Compose files
echo ""
echo "📋 Validating Docker Compose configurations..."

# Development environment
echo "  Testing docker-compose.yml (development)..."
if docker compose -f docker-compose.yml config --quiet; then
    echo "  ✅ Development compose file is valid"
else
    echo "  ❌ Development compose file has errors"
    exit 1
fi

# Test environment
echo "  Testing docker-compose.test.yml..."
if docker compose -f docker-compose.test.yml config --quiet; then
    echo "  ✅ Test compose file is valid"
else
    echo "  ❌ Test compose file has errors"
    exit 1
fi

# Production environment
echo "  Testing docker-compose.prod.yml..."
if docker compose -f docker-compose.prod.yml config --quiet; then
    echo "  ✅ Production compose file is valid"
else
    echo "  ❌ Production compose file has errors"
    exit 1
fi

# Check environment files
echo ""
echo "📋 Checking environment configuration files..."
ENV_FILES=(".env.development" ".env.test" ".env.production" "backend/.env.example")
for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        echo "  ✅ $env_file exists"
    else
        echo "  ❌ $env_file not found"
        exit 1
    fi
done

# Check deployment scripts
echo ""
echo "📋 Checking deployment scripts..."
SCRIPTS=("scripts/deploy-dev.sh" "scripts/deploy-test.sh" "scripts/deploy.sh" "scripts/setup-ssl.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo "  ✅ $script exists and is executable"
    else
        echo "  ❌ $script not found or not executable"
        exit 1
    fi
done

# Check Dockerfiles
echo ""
echo "📋 Checking Dockerfiles..."
DOCKERFILES=("backend/Dockerfile" "frontend/Dockerfile")
for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        echo "  ✅ $dockerfile exists"
    else
        echo "  ❌ $dockerfile not found"
        exit 1
    fi
done

# Check nginx configuration
echo ""
echo "📋 Checking Nginx configuration..."
if [ -f "nginx/nginx.conf" ]; then
    echo "  ✅ nginx/nginx.conf exists"
else
    echo "  ❌ nginx/nginx.conf not found"
    exit 1
fi

if [ -f "frontend/nginx.conf" ]; then
    echo "  ✅ frontend/nginx.conf exists"
else
    echo "  ❌ frontend/nginx.conf not found"
    exit 1
fi

# Check monitoring configuration
echo ""
echo "📋 Checking monitoring configuration..."
MONITORING_FILES=("monitoring/prometheus.yml" "monitoring/grafana/provisioning/datasources/prometheus.yml")
for mon_file in "${MONITORING_FILES[@]}"; do
    if [ -f "$mon_file" ]; then
        echo "  ✅ $mon_file exists"
    else
        echo "  ❌ $mon_file not found"
        exit 1
    fi
done

# Check documentation
echo ""
echo "📋 Checking documentation..."
DOCS=("DOCKER.md" "DEPLOYMENT.md" "README.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc exists"
    else
        echo "  ❌ $doc not found"
        exit 1
    fi
done

# Test environment variable parsing
echo ""
echo "📋 Testing environment variable configuration..."
for env_file in ".env.development" ".env.test" ".env.production"; do
    if [ -f "$env_file" ]; then
        # Check if file has required variables
        required_vars=("ENVIRONMENT" "SECRET_KEY" "DATABASE_URL" "REDIS_URL")
        missing_vars=0
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$env_file" 2>/dev/null; then
                echo "  ⚠️  Required variable $var not found in $env_file"
                missing_vars=$((missing_vars + 1))
            fi
        done
        if [ $missing_vars -eq 0 ]; then
            echo "  ✅ $env_file has all required variables"
        fi
    fi
done

# Port conflict check
echo ""
echo "📋 Checking for potential port conflicts..."
PORTS=(3000 8000 5432 5433 6379 6380 80 443 9090 3001)
for port in "${PORTS[@]}"; do
    if ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo "  ⚠️  Port $port is already in use (may cause conflicts)"
    else
        echo "  ✅ Port $port is available"
    fi
done

echo ""
echo "🎉 Deployment configuration validation completed successfully!"
echo ""
echo "📚 Quick start commands:"
echo "  Development: ./scripts/deploy-dev.sh"
echo "  Test:        ./scripts/deploy-test.sh"  
echo "  Production:  ./scripts/deploy.sh your-domain.com .env"
echo ""
echo "📖 For detailed instructions, see:"
echo "  - DOCKER.md for Docker-specific guide"
echo "  - DEPLOYMENT.md for comprehensive deployment guide"