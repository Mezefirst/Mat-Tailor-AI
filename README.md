# Mat-Tailor-AI

MatTailor AI that empowers engineers, designers, and manufacturers to discover, simulate, tailor, and source optimal materials for specific applications—without compromising performance, cost, or sustainability.

## 🎉 Docker Deployment Status: ✅ WORKING

The Docker deployment has been successfully fixed and tested. All backend services are operational.

## 🚀 Quick Start with Docker

### Option 1: Backend Services Only (Recommended for Testing)
```bash
git clone https://github.com/Mezefirst/Mat-Tailor-AI.git
cd Mat-Tailor-AI

# Quick start with deployment script
./deploy.sh backend-only

# Or manually with docker compose
docker compose -f docker-compose.backend-only.yml up -d

# Test the API
curl http://localhost:8000/health
```

**Access points:**
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- API Root: http://localhost:8000/

### Option 2: Full Development Environment
```bash
# Start all services including frontend
./deploy.sh dev

# Access at:
# Frontend: http://localhost:3000
# API: http://localhost:8000/docs
```

### Option 3: Production Environment
```bash
cp .env.template .env
# Edit .env with your production values
./deploy.sh prod
```

## 📚 Documentation

- **[DOCKER.md](DOCKER.md)** - Complete Docker deployment guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment options
- **[PRD.md](PRD.md)** - Product requirements document
- **[PRODUCTION.md](PRODUCTION.md)** - Production deployment guide

## ✅ Validate Configuration

Run the validation script to check your deployment setup:
```bash
./scripts/validate-deployment.sh
```

## 🏗️ Architecture

- **Frontend**: React PWA with Material-UI
- **Backend**: FastAPI with async/await support
- **Database**: PostgreSQL with async connection pooling
- **Cache**: Redis for caching and session management
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker with multi-environment support
