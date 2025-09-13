# Mat-Tailor-AI

MatTailor AI that empowers engineers, designers, and manufacturers to discover, simulate, tailor, and source optimal materials for specific applications—without compromising performance, cost, or sustainability.

## 🚀 Quick Start with Docker

### Development Environment
```bash
git clone https://github.com/Mezefirst/Mat-Tailor-AI.git
cd Mat-Tailor-AI
./scripts/deploy-dev.sh
```
Access at: http://localhost:3000

### Test Environment
```bash
cp .env.test .env.test.local
# Edit .env.test.local with your API keys
./scripts/deploy-test.sh .env.test.local
```

### Production Environment
```bash
cp .env.production .env
# Edit .env with your production values
./scripts/deploy.sh your-domain.com .env
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
