# Deployment Guide (Free Tier)

## Prerequisites
1. Create accounts on:
   - Render (backend deployment)
   - Vercel (frontend deployment)
2. Install Vercel CLI: `npm i -g vercel`

## Step 1: Backend Deployment (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Connect your GitHub repository or upload `backend.tar.gz`
4. Configure the service:
   ```
   Name: python-dsa-assistant-backend
   Environment: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT --workers 4 --limit-concurrency 1000
   ```
5. Set environment variables:
   - `HUGGINGFACE_API_KEY`
   - `OPENAI_API_KEY`
   - `PORT=5000`

6. Deploy and wait for build completion
7. Copy your backend URL (e.g., https://your-app.onrender.com)
8. Test backend: Visit https://your-app.onrender.com/api/health

## Step 2: Frontend Deployment (Vercel)

1. Commit all changes to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure build settings:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Install Command: npm install
   ```
6. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
   - `HUGGINGFACE_API_KEY`
   - `OPENAI_API_KEY`

7. Deploy and wait for build completion

## Step 3: Verify Deployment

1. Backend Health Check:
   - Visit: `https://your-app.onrender.com/api/health`
   - Should see: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

2. Frontend Check:
   - Visit your Vercel deployment URL
   - Try the chat functionality
   - Test file upload feature

## Troubleshooting

### Backend Issues:
- Check Render logs for Python errors
- Verify environment variables are set
- Ensure backend URL is correct in frontend config

### Frontend Issues:
- Check Vercel build logs
- Verify API URL is correct
- Check browser console for errors

## Monitoring

- Backend: Render Dashboard → Logs  (See also Render's metrics dashboard)
- Frontend: Vercel Dashboard → Analytics (Monitor page views, load times, and track API route performance)
- API Health: /api/health endpoint


## Free Tier Limits

### Render Free Tier:
- 750 hours/month runtime
- 100 GB/month bandwidth
- Automatic HTTPS
- Build minutes: 400/month

### Vercel Free Tier:
- Unlimited personal projects
- Automatic HTTPS
- Global CDN
- Basic analytics


## Scaling Options (for future reference)

### Frontend Scaling (Vercel)
1. Edge Network: Configure regions and function memory/duration in `vercel.json` as shown in the original document.
2. Caching Strategies: Implement ISR, stale-while-revalidate, and React Query caching.
3. Performance Optimizations: Enable image optimization, use dynamic imports, implement code splitting, and enable compression.

### Backend Scaling (Render)
1. Horizontal Scaling: Scale to multiple instances using Render's auto-scaling based on CPU/Memory usage and configure a load balancer.
2. Memory and CPU: Adjust CPU (1-4 vCPUs) and Memory (512MB-8GB) and Concurrent connections (up to 1000) in the Render Dashboard.
3. Caching Layer: Consider adding Redis caching using `fastapi-cache`.  (See original document for code example).
4. Rate Limiting: Implement rate limiting using FastAPI's `ThrottlingMiddleware`. (See original document for code example).


### Database Scaling
1. Connection Pooling: Use `databases` library with connection pooling (`min_size`, `max_size`). (See original document for code example).
2. Query Optimization: Index frequently accessed fields, implement pagination, and use efficient queries.


## Environment Setup
Create a `.env` file for local development:
```env
HUGGINGFACE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Deployment Commands

```bash
# Frontend (Vercel)
cd frontend
vercel deploy # Or connect your GitHub repo

# Backend (Render)
# Connect your GitHub repo; Render handles the rest