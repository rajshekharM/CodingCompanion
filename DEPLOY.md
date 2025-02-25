# Deployment Guide

## Prerequisites
1. Vercel CLI installed: `npm i -g vercel`
2. Accounts on:
   - Vercel (frontend)
   - Render (backend)
   - HuggingFace (API key)
   - OpenAI (API key)


## Environment Variables Setup

### Backend (Render)
Required environment variables:
```
HUGGINGFACE_API_KEY=your_huggingface_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

### Frontend (Vercel)
Required environment variables:
```
NEXT_PUBLIC_API_URL=your_backend_url
HUGGINGFACE_API_KEY=your_huggingface_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 1. Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project" and select your GitHub repository
4. Configure environment variables in Vercel Dashboard
5. Click Deploy

## 2. Backend Deployment (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Choose "Connect your GitHub repository"
4. Select your repository
5. Configure the service:
   - Name: python-dsa-assistant-backend
   - Environment: Python 3
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT --workers 4 --limit-concurrency 1000`
   - Add environment variables in Render Dashboard

Benefits of GitHub Integration:
- Automatic deployments when you push changes
- Version control and rollback capabilities
- Better collaboration workflow
- Deploy preview environments for pull requests

## 3. Post-Deployment Verification

1. Verify Backend Health:
   - Access `https://your-backend-url/api/health`
   - Should return: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

2. Verify Frontend:
   - Access your Vercel deployment URL
   - Test the chat functionality
   - Verify file upload works
   - Check code execution capabilities

## Troubleshooting

1. If backend health check fails:
   - Verify all environment variables are set correctly
   - Check Render logs for any Python errors
   - Ensure the Procfile is properly configured

2. If frontend fails:
   - Verify NEXT_PUBLIC_API_URL points to the correct backend URL
   - Check browser console for any API connection errors
   - Verify HuggingFace API key is properly set

## Monitoring

1. Backend Logs: Render Dashboard -> Your Service -> Logs
2. Frontend Analytics: Vercel Dashboard -> Your Project -> Analytics
3. Health Status: `/api/health` endpoint