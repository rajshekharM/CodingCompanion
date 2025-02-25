# Deployment Guide (Free Tier)

## Prerequisites
1. Create accounts on:
   - Render (backend deployment)
   - Vercel (frontend deployment)
2. Install Vercel CLI: `npm i -g vercel`
3. Ensure your code is pushed to GitHub

## Continuous Integration Setup

### 1. Replit-GitHub Integration
1. In Replit:
   - Click on "Version Control" in the left sidebar
   - Click "Connect to GitHub"
   - Select your repository
   - Authorize Replit
2. Configure auto-sync:
   - Changes in Replit automatically commit to GitHub
   - Deployments trigger automatically

### 2. GitHub-Render Integration (Backend)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Choose "Connect your GitHub repository"
4. Select your repository
5. Configure the service:
   ```
   Name: python-dsa-assistant-backend
   Environment: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT --workers 4 --limit-concurrency 1000
   ```
6. Set environment variables:
   - `HUGGINGFACE_API_KEY`
   - `OPENAI_API_KEY`
   - `PORT=5000`
7. Enable "Auto-Deploy" in settings

### 3. GitHub-Vercel Integration (Frontend)
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure build settings:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Install Command: npm install
   ```
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
   - `HUGGINGFACE_API_KEY`
   - `OPENAI_API_KEY`
6. Enable "Auto-Deploy" in project settings

## Development Workflow

1. Make changes in Replit
2. Test changes locally
3. Commit in Replit's Version Control
4. Changes automatically:
   - Push to GitHub
   - Deploy to Vercel (frontend)
   - Deploy to Render (backend)

## Verification Steps

### 1. Backend Health Check
- Visit: `https://your-app.onrender.com/api/health`
- Should see: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

### 2. Frontend Check
- Visit your Vercel deployment URL
- Try the chat functionality
- Test file upload feature

## Troubleshooting

### GitHub Integration Issues
- Verify Replit has correct GitHub permissions
- Check GitHub repository settings
- Ensure branch protection rules don't block auto-sync

### Backend Issues
- Check Render logs for Python errors
- Verify environment variables are set
- Ensure backend URL is correct in frontend config

### Frontend Issues
- Check Vercel build logs
- Verify API URL is correct
- Check browser console for errors

## Monitoring

- Backend: Render Dashboard → Logs (See also Render's metrics dashboard)
- Frontend: Vercel Dashboard → Analytics
- GitHub: Repository Actions tab
- API Health: /api/health endpoint

## Free Tier Limits

### Render Free Tier
- 750 hours/month runtime
- 100 GB/month bandwidth
- Automatic HTTPS
- Build minutes: 400/month
- Automatic deployments from GitHub

### Vercel Free Tier
- Unlimited personal projects
- Automatic HTTPS
- Global CDN
- Basic analytics
- Automatic deployments from GitHub

## Environment Setup
Create a `.env` file for local development:
```env
HUGGINGFACE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## Making Changes

1. Make changes to your local code in Replit
2. Test changes using the dev server
3. Commit changes in Replit's Version Control
4. Automatic deployment will trigger on both platforms
5. Monitor deployment progress in respective dashboards