# MatTailor AI Deployment Guide

## Quick Deploy Options

### Frontend Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
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
   VITE_API_URL=https://your-backend-url.com
   VITE_ENVIRONMENT=production
   ```

### Backend Deployment

#### Railway (Recommended)
1. Connect GitHub repository
2. Select backend folder as root
3. Railway will auto-detect Python and install requirements
4. Set environment variables:
   ```
   ENVIRONMENT=production
   SECRET_KEY=your-secret-key
   OPENAI_API_KEY=your-openai-key (optional)
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
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_APP_NAME=MatTailor AI
```

### Backend (.env)
```
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/mattailor
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-hf-key
CORS_ORIGINS=["http://localhost:3000","https://your-frontend.com"]
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
- Use Let's Encrypt for SSL certificates
- Configure HSTS headers
- Implement proper CORS policies

### API Security
- Rate limiting implemented
- Input validation on all endpoints
- SQL injection protection via ORM
- Secrets management via environment variables

### Frontend Security
- Content Security Policy headers
- XSS protection
- Secure cookie handling

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

## Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS_ORIGINS in backend config
2. **Database connection**: Verify DATABASE_URL format
3. **ML model loading**: Check model file permissions
4. **Memory issues**: Increase container memory limits

### Debug Commands
```bash
# Backend logs
docker-compose logs backend

# Database connection test
docker-compose exec backend python -c "from services.database import MaterialDatabase; print('DB OK')"

# Frontend build issues
docker-compose exec frontend npm run build
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
