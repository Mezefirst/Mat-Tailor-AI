# Docker Deployment Guide for MatTailor AI

This guide covers Docker deployment for all environments: development, test, and production.

## Prerequisites

- **Docker Engine** 20.10+ 
- **Docker Compose** v2 (comes with Docker Desktop)
- **Git** for cloning the repository

## Quick Start

### 1. Development Environment (Local Development)

Perfect for local development with hot reloading:

```bash
# Clone the repository
git clone https://github.com/Mezefirst/Mat-Tailor-AI.git
cd Mat-Tailor-AI

# Start development environment
./scripts/deploy-dev.sh

# Access your application
# Frontend: http://localhost:3000
# API: http://localhost:8000/docs
```

### 2. Test Environment (CI/CD & Staging)

Isolated test environment with separate database:

```bash
# Configure test environment
cp .env.test .env.test.local
# Edit .env.test.local with your test API keys

# Deploy test environment
./scripts/deploy-test.sh .env.test.local

# Access test application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# PostgreSQL: localhost:5433
# Redis: localhost:6380
```

### 3. Production Environment (Live Deployment)

Secure production deployment with SSL, monitoring, and optimization:

```bash
# Configure production environment
cp .env.production .env
# Edit .env with your production values

# Deploy with SSL (requires domain)
./scripts/deploy.sh your-domain.com .env

# Access production application
# Frontend: https://your-domain.com
# API: https://api.your-domain.com
# Monitoring: https://monitoring.your-domain.com
```

## Environment Files

| Environment | File | Purpose |
|-------------|------|---------|
| Development | `.env.development` | Local development with debugging |
| Test | `.env.test` | Isolated testing environment |
| Production | `.env.production` | Secure production deployment |

## Docker Compose Files

| File | Environment | Features |
|------|-------------|----------|
| `docker-compose.yml` | Development | Hot reloading, volume mounts, debug ports |
| `docker-compose.test.yml` | Test | Isolated DB, test ports, minimal security |
| `docker-compose.prod.yml` | Production | SSL, monitoring, security, optimization |

## Service Architecture

### Core Services
- **Frontend**: React PWA with Nginx (Port 3000/80)
- **Backend**: FastAPI application (Port 8000)  
- **Database**: PostgreSQL 15 (Port 5432/5433)
- **Cache**: Redis 7 (Port 6379/6380)

### Production-Only Services
- **Nginx**: SSL termination and reverse proxy (Ports 80/443)
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Monitoring dashboards (Port 3001)

## Common Commands

### Managing Services

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build

# Scale backend
docker compose up -d --scale backend=3
```

### Debugging

```bash
# Backend shell
docker compose exec backend bash

# Database shell
docker compose exec postgres psql -U postgres -d mattailor

# Redis shell
docker compose exec redis redis-cli

# View service status
docker compose ps
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000

# Database connection test
docker compose exec backend python -c "
import asyncpg, asyncio, os
asyncio.run(asyncpg.connect(os.getenv('DATABASE_URL')).close())
print('Database OK')
"
```

## Environment Configuration

### Required Variables

```bash
ENVIRONMENT=development|test|production
SECRET_KEY=your-strong-secret-key-here
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://host:port/db
```

### Optional API Keys

```bash
OPENAI_API_KEY=sk-...
HUGGINGFACE_API_KEY=hf_...
MATWEB_API_KEY=your-matweb-key
MATERIALS_PROJECT_API_KEY=your-mp-key
```

### Production-Only Variables

```bash
CORS_ORIGINS=["https://yourdomain.com"]
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
GRAFANA_PASSWORD=secure-monitoring-password
```

## Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-dev.sh` | Development deployment | `./scripts/deploy-dev.sh` |
| `deploy-test.sh` | Test environment | `./scripts/deploy-test.sh .env.test` |
| `deploy.sh` | Production deployment | `./scripts/deploy.sh domain.com .env` |
| `setup-ssl.sh` | SSL certificate setup | `./scripts/setup-ssl.sh domain.com` |

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000

# Stop conflicting services
docker compose down
```

#### Database Connection Issues
```bash
# Check database logs
docker compose logs postgres

# Verify database is running
docker compose ps postgres

# Test connection from backend
docker compose exec backend python -c "
import os
print('DATABASE_URL:', os.getenv('DATABASE_URL'))
"
```

#### Frontend Build Failures
```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose up -d --no-deps --build frontend

# Access frontend container
docker compose exec frontend sh
```

#### SSL Certificate Issues (Production)
```bash
# Regenerate certificates
./scripts/setup-ssl.sh your-domain.com

# Check certificate files
ls -la nginx/ssl/

# View nginx logs
docker compose logs nginx
```

### Performance Optimization

#### Database
```bash
# Monitor database performance
docker compose exec postgres psql -U postgres -d mattailor -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
"
```

#### Redis Cache
```bash
# Monitor cache hit rate
docker compose exec redis redis-cli info stats
```

#### Application Metrics
- Access Grafana: `https://monitoring.your-domain.com` (production)
- View Prometheus: `http://localhost:9090` (production)

## Security Considerations

### Development
- Use weak passwords (they're in the config files)
- HTTP only (no SSL required)
- Debug mode enabled
- CORS allows localhost

### Test
- Stronger passwords
- HTTP only (SSL optional)  
- Debug mode disabled
- CORS restricted to test domains

### Production
- Strong passwords required
- HTTPS enforced (SSL required)
- Debug mode disabled
- CORS restricted to production domains
- Security headers enabled
- Rate limiting active

## Data Persistence

### Volumes
- `postgres-data`: Database files
- `redis-data`: Cache data  
- `models-cache`: ML model files
- `frontend-dist`: Built frontend assets (production)

### Backups
```bash
# Database backup
docker compose exec postgres pg_dump -U postgres mattailor > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres mattailor < backup.sql
```

## Monitoring & Logs

### Log Locations
- Application logs: `docker compose logs [service]`
- Nginx logs: `./nginx/logs/` (production)
- Database logs: PostgreSQL container logs

### Monitoring Stack (Production)
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Nginx**: Access and error logs

### Health Endpoints
- Backend: `GET /health`
- Detailed status: `GET /health/detailed`

## Scaling Considerations

### Horizontal Scaling
```bash
# Scale backend service
docker compose up -d --scale backend=3

# Scale with load balancer (production)
# Configure nginx upstream in nginx.conf
```

### Vertical Scaling
```yaml
# In docker-compose files, add resource limits
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1g
          cpus: '0.5'
```

## CI/CD Integration

### GitHub Actions
The repository includes `.github/workflows/ci-cd.yml` for automated testing and deployment.

### Manual Testing
```bash
# Run configuration tests
python scripts/test-deployment.py

# Validate compose files
docker compose -f docker-compose.test.yml config --quiet
docker compose -f docker-compose.prod.yml config --quiet
```

## Support

For issues with Docker deployment:

1. Check logs: `docker compose logs -f`
2. Verify configuration: `docker compose config`
3. Test health endpoints: `curl http://localhost:8000/health`
4. Review environment variables: `docker compose exec backend env`

For production issues, also check:
- SSL certificate validity
- DNS configuration  
- Firewall settings
- Domain configuration