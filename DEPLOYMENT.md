# MatTailor AI Deployment Guide

# MatTailor AI Deployment Guide

## Quick Deploy Options

### Development Deployment (Local Development)

#### Prerequisites
- Docker and Docker Compose v2
- Git

#### Quick Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Mezefirst/Mat-Tailor-AI.git
   cd Mat-Tailor-AI
   ```

2. Run development deployment:
   ```bash
   ./scripts/deploy-dev.sh
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Test Deployment (Staging Environment)

#### Prerequisites
- Docker and Docker Compose v2
- Environment variables configured

#### Quick Test Setup
1. Create test environment file:
   ```bash
   cp .env.test .env.test.local
   # Edit .env.test.local with your test values
   ```

2. Run test deployment:
   ```bash
   ./scripts/deploy-test.sh .env.test.local
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - PostgreSQL: localhost:5433
   - Redis: localhost:6380

### Production Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose
- Domain name with DNS pointing to your server
- SSL certificates (Let's Encrypt recommended)

#### Quick Production Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Mezefirst/Mat-Tailor-AI.git
   cd Mat-Tailor-AI
   ```

3. Create production environment file:
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

4. Run automated deployment:
   ```bash
   ./scripts/deploy.sh your-domain.com .env
   ```

#### Manual Production Setup
1. Set up SSL certificates:
   ```bash
   ./scripts/setup-ssl.sh your-domain.com
   ```

2. Configure environment variables in `.env`

4. Deploy with Docker Compose:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

## Environment Configurations

### Available Environment Files
- `.env.development` - Local development with hot reloading
- `.env.test` - Test/staging environment with isolated database
- `.env.production` - Production environment with security optimizations

### Environment Variables Overview

#### Required for All Environments
```bash
ENVIRONMENT=development|test|production
SECRET_KEY=your-strong-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/db
```

#### API Keys (Optional but Recommended)
```bash
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-hf-key
MATWEB_API_KEY=your-matweb-key
MATERIALS_PROJECT_API_KEY=your-mp-key
```

#### Production-Only Variables
```bash
CORS_ORIGINS=["https://yourdomain.com"]
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
GRAFANA_PASSWORD=secure-password
```

### Frontend Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://api.your-domain.com
   VITE_ENVIRONMENT=production
   ```
5. Deploy automatically on git push

#### Netlify
1. Connect repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   ```
   VITE_API_URL=https://api.your-domain.com
   VITE_ENVIRONMENT=production
   ```

### Backend Deployment

#### Production Docker (Recommended)
Use the included production configuration:
```bash
# Configure environment variables
cp backend/.env.example .env
nano .env  # Edit with your production values

# Deploy with SSL and monitoring
./scripts/deploy.sh your-domain.com .env
```

This includes:
- HTTPS with Let's Encrypt SSL
- Rate limiting and security headers
- PostgreSQL database with connection pooling
- Redis caching
- Prometheus monitoring
- Grafana dashboards
- Automated health checks

#### Railway (Alternative)
1. Connect GitHub repository
2. Select backend folder as root
3. Railway will auto-detect Python and install requirements
4. Set environment variables:
   ```
   ENVIRONMENT=production
   SECRET_KEY=your-secret-key
   OPENAI_API_KEY=your-openai-key
   MATWEB_API_KEY=your-matweb-key
   MATERIALS_PROJECT_API_KEY=your-materials-project-key
   ```

#### Heroku
1. Install Heroku CLI
2. Create app: `heroku create mattailor-backend`
3. Set buildpack: `heroku buildpacks:set heroku/python`
4. Configure environment variables:
   ```bash
   heroku config:set ENVIRONMENT=production
   heroku config:set SECRET_KEY=your-secret-key
   ```
5. Deploy: `git push heroku main`

#### Google Cloud Run
1. Build image: `docker build -t mattailor-backend ./backend`
2. Tag for GCR: `docker tag mattailor-backend gcr.io/PROJECT_ID/mattailor-backend`
3. Push: `docker push gcr.io/PROJECT_ID/mattailor-backend`
4. Deploy: `gcloud run deploy --image gcr.io/PROJECT_ID/mattailor-backend`

### Full Stack with Docker

#### Local Development
```bash
# Clone repository
git clone https://github.com/your-repo/mattailor-ai
cd mattailor-ai

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Production Deployment
```bash
# Production compose file
docker-compose -f docker-compose.prod.yml up -d

# With SSL
docker-compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://api.mattailor.com
VITE_ENVIRONMENT=production
VITE_APP_NAME=MatTailor AI
```

### Backend (.env)
```
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-strong-secret-key-change-this-in-production
DATABASE_URL=postgresql://user:pass@localhost/mattailor
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-hf-key
MATWEB_API_KEY=your-matweb-api-key
MATERIALS_PROJECT_API_KEY=your-materials-project-key
CORS_ORIGINS=["https://mattailor.com","https://www.mattailor.com"]
FRONTEND_URL=https://mattailor.com
BACKEND_URL=https://api.mattailor.com
```

## Database Setup

### PostgreSQL (Production)
```sql
-- Create database
CREATE DATABASE mattailor;

-- Create user
CREATE USER mattailor WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mattailor TO mattailor;
```

### Migration Commands
```bash
# Install alembic
pip install alembic

# Initialize migrations
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Initial tables"

# Apply migrations
alembic upgrade head
```

## Performance Optimization

### Backend Scaling
- Use gunicorn with multiple workers: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
- Enable Redis caching for recommendations
- Implement database connection pooling
- Use CDN for static assets

### Frontend Optimization
- Enable PWA caching
- Implement lazy loading for components
- Use React.memo for expensive components
- Bundle size optimization with tree shaking

## Monitoring & Health Checks

### Health Check Endpoints
- Backend: `GET /health`
- Detailed status: `GET /health/detailed`

### Monitoring Setup
```bash
# Add monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Log Aggregation
- Use structured logging (JSON format)
- Configure log rotation
- Set up centralized logging (ELK stack or similar)

## Security Considerations

### HTTPS Setup
- Automatic SSL certificate generation with Let's Encrypt
- HSTS headers for enhanced security
- Secure cookie handling
- Proper Content Security Policy headers

### API Security
- Rate limiting: 30 requests/minute for AI endpoints, 100/minute for static
- Input validation on all endpoints
- SQL injection protection via parameterized queries
- No sensitive data in error responses
- CORS properly configured for production domains

## Third-Party Data Source Integration

### MatWeb Integration
1. Sign up for MatWeb API access at https://matweb.com/api
2. Add your API key to environment variables:
   ```bash
   MATWEB_API_KEY=your-matweb-api-key
   ```
3. Ensure compliance with MatWeb's data licensing terms
4. Configure rate limits according to your subscription tier

### Materials Project Integration  
1. Register at https://materialsproject.org/ and get API key
2. Add your API key to environment variables:
   ```bash
   MATERIALS_PROJECT_API_KEY=your-materials-project-api-key
   ```
3. Review and comply with Materials Project data usage policies
4. Set appropriate caching TTL to respect API quotas

### API Key Security
- Store all API keys as environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Regularly rotate API keys for security
- Monitor API usage to detect unusual activity

### Data Licensing Compliance
- Review terms of service for each data provider
- Implement proper attribution where required
- Cache data appropriately to minimize API calls
- Respect rate limits and usage quotas
- Consider data retention policies

## Rate Limiting Configuration

### API Rate Limits (per minute)
- `/recommend`: 30 requests - AI-powered recommendations are resource intensive
- `/tradeoff`: 20 requests - Complex analysis operations
- `/simulate`: 20 requests - Material property simulations  
- `/plan_rl`: 10 requests - Reinforcement learning operations
- `/materials/search`: 60 requests - Standard search operations
- `/materials/{id}`: 100 requests - Material detail retrieval
- `/suppliers`: 60 requests - Supplier information lookup
- `/health`: 200 requests - Health check endpoint

### Nginx Rate Limits
- API endpoints: 60 requests/minute with burst of 10
- Static assets: 100 requests/minute with burst of 20
- Global rate limiting by IP address

### Customizing Rate Limits
Update the rate limits in `backend/main.py`:
```python
@limiter.limit("30/minute")  # Adjust as needed
async def recommend_materials(request: Request, query: MaterialQuery):
```

For Nginx, edit `nginx/nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
```

### Monitoring Security
- Grafana dashboard protected with basic auth
- Prometheus metrics secured
- Access logs for security analysis
- Automated alerting for suspicious activity

## Backup & Recovery

### Database Backups
```bash
# Automated daily backups
pg_dump mattailor > backup_$(date +%Y%m%d).sql

# Restore from backup
psql mattailor < backup_20231201.sql
```

### Model Backups
- Backup trained ML models to cloud storage
- Version control for model artifacts
- Automated model retraining pipelines

## Troubleshooting Deployment

### Common Issues

#### SSL Certificate Problems
```bash
# Check certificate status
./scripts/setup-ssl.sh your-domain.com

# Verify certificate files
ls -la nginx/ssl/
```

#### CORS Errors
1. Verify CORS_ORIGINS environment variable is set correctly
2. Check that frontend URL matches allowed origins
3. Ensure HTTPS is used consistently

#### Database Connection Issues
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker compose -f docker-compose.prod.yml exec backend python -c "
import asyncpg
import os
import asyncio
async def test(): 
    conn = await asyncpg.connect(os.getenv('DATABASE_URL'))
    await conn.close()
    print('Database connected successfully')
asyncio.run(test())
"
```

#### API Rate Limiting
- Monitor rate limit headers in API responses
- Adjust limits in `backend/main.py` if needed
- Check Nginx access logs for rate limit violations

#### Environment Variables
```bash
# Verify all required environment variables are set
docker compose -f docker-compose.prod.yml exec backend env | grep -E "(SECRET_KEY|DATABASE_URL|CORS_ORIGINS)"
```

### Health Checks
- Backend: `GET /health`
- Frontend: Check if main page loads
- Database: Connection test in backend logs
- Redis: Cache operations in backend logs

### Log Analysis
```bash
# View all service logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs postgres
```

### Performance Monitoring
- Access Grafana dashboard at https://monitoring.your-domain.com
- Monitor API response times and error rates
- Check database performance metrics
- Review cache hit rates in Redis

## Legacy Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS_ORIGINS in backend config
2. **Database connection**: Verify DATABASE_URL format
3. **ML model loading**: Check model file permissions
4. **Memory issues**: Increase container memory limits

### Debug Commands
```bash
# Backend logs
docker compose logs backend

# Database connection test
docker compose exec backend python -c "from services.database import MaterialDatabase; print('DB OK')"

# Frontend build issues
docker compose exec frontend npm run build
```

## Scaling Architecture

### Microservices Migration
- Separate recommendation engine into dedicated service
- Extract ML prediction service
- Implement API gateway for routing

### Load Balancing
- Use nginx or cloud load balancer
- Implement sticky sessions if needed
- Database read replicas for scaling

### Caching Strategy
- Redis for API response caching
- CDN for static assets
- Browser caching for PWA assets

## Cost Optimization

### Cloud Costs
- Use spot instances for ML training
- Implement auto-scaling groups
- Optimize database instance sizes
- Use cloud storage for large datasets

### Development Costs
- Use free tiers for development
- Implement resource auto-shutdown
- Monitor usage with billing alerts
