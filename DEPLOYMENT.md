# Deployment Guide (Free Tier)

## Frontend Deployment (Vercel - Free)

1. Push your code to GitHub
2. Sign up for Vercel (vercel.com) - No credit card required
3. Import your repository
4. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API key
5. Deploy! Vercel's free tier includes:
   - Automatic HTTPS
   - Global CDN
   - Automatic deployments
   - Basic analytics
   - Unlimited personal projects

## Backend Deployment (Render - Free)

1. Sign up for Render (render.com) - No credit card required
2. Create a new Web Service
3. Connect your repository
4. Configure as Python app:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API key
6. Deploy! Render's free tier includes:
   - Automatic HTTPS
   - Global CDN
   - 750 hours/month of runtime
   - Automatic deployments

## Scaling Options

### Frontend Scaling (Vercel)
1. Edge Network:
   ```json
   {
     "regions": ["all"],
     "functions": {
       "api/*.ts": {
         "memory": 1024,
         "maxDuration": 10
       }
     }
   }
   ```

2. Caching Strategies:
   - Enable ISR (Incremental Static Regeneration)
   - Configure stale-while-revalidate
   - Use React Query's caching capabilities

3. Performance Optimizations:
   - Enable image optimization
   - Use dynamic imports
   - Implement code splitting
   - Enable compression

### Backend Scaling (Render)
1. Horizontal Scaling:
   - Scale to multiple instances
   - Auto-scaling based on CPU/Memory usage
   - Load balancer configuration

2. Memory and CPU:
   ```bash
   # In Render Dashboard:
   - CPU: 1-4 vCPUs
   - Memory: 512MB-8GB
   - Concurrent connections: Up to 1000
   ```

3. Caching Layer:
   ```python
   # Add Redis caching for responses
   from fastapi_cache import FastAPICache
   from fastapi_cache.backends.redis import RedisBackend

   @app.on_event("startup")
   async def startup():
       FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

   @app.get("/api/messages", response_model=List[Message])
   @cache(expire=60)  # Cache for 60 seconds
   async def get_messages():
       return messages
   ```

4. Rate Limiting:
   ```python
   from fastapi import Request
   from fastapi.middleware.throttling import ThrottlingMiddleware

   app.add_middleware(
       ThrottlingMiddleware,
       rate=100,  # requests
       period=60  # seconds
   )
   ```

### Database Scaling
1. Connection Pooling:
   ```python
   from databases import Database

   DATABASE_URL = os.getenv("DATABASE_URL")
   database = Database(DATABASE_URL, min_size=5, max_size=20)
   ```

2. Query Optimization:
   - Index frequently accessed fields
   - Implement pagination
   - Use efficient queries

### Monitoring and Alerts
1. Application Logs:
   - All logs are stored in `app.log`
   - View logs directly in Render's dashboard
   - Use Render's metrics dashboard

2. Frontend Analytics (Free):
   - Use Vercel's built-in analytics
   - Monitor page views, load times
   - Track API route performance

3. Performance Monitoring:
   ```python
   from prometheus_fastapi_instrumentator import Instrumentator

   @app.on_event("startup")
   async def startup():
       Instrumentator().instrument(app).expose(app)
   ```

## Cost Management Tips
1. Use serverless functions to minimize idle time
2. Implement proper caching
3. Monitor bandwidth usage
4. Set up usage alerts in Render dashboard

## Environment Setup
Create a `.env` file for local development:
```env
HUGGINGFACE_API_KEY=your_key_here
```

## Free Monitoring Setup

1. Application Logs:
   - All logs are stored in `app.log`
   - View logs directly in Render's dashboard
   - Use Render's metrics dashboard

2. Frontend Analytics (Free):
   - Use Vercel's built-in analytics
   - Monitor page views, load times
   - Track API route performance


## Deployment Commands

```bash
# Frontend (Vercel)
cd frontend
vercel deploy # Just connect your GitHub repo instead

# Backend (Render)
# Just connect your GitHub repo, Render handles the rest
```

## Important Free Tier Limits

### Vercel Free Tier:
- Unlimited personal projects
- Automatic HTTPS
- Global CDN
- Serverless functions
- Basic analytics
- Team size: 1

### Render Free Tier:
- 750 hours/month runtime
- 100 GB/month bandwidth
- Automatic HTTPS
- Basic DDoS protection
- Build minutes: 400/month

## Monitoring Dashboard Access

- Application logs: Render Dashboard -> Your Service -> Logs
- Frontend analytics: Vercel Dashboard -> Your Project -> Analytics
- API metrics: Render Dashboard -> Your Service -> Metrics