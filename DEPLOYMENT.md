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

3. Vercel Analytics Setup:
```javascript
// Already configured in _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics /> {/* Free analytics! */}
    </>
  );
}
```

## Deployment Commands

```bash
# Frontend (Vercel)
cd frontend
vercel deploy # Just connect your GitHub repo instead

# Backend (Render)
# Just connect your GitHub repo, Render handles the rest
```

## GitHub Sync & Automatic Deployment

### Setting Up GitHub Sync in Replit
1. In your Replit project:
   - Click "Version Control" in the left sidebar
   - Click "Connect to GitHub"
   - Select your repository
   - Authorize Replit

2. Making Changes:
   - Edit files in Replit
   - Commit changes using Replit's Version Control
   - Changes automatically push to GitHub

3. Automatic Deployment Flow:
   - Changes pushed to GitHub
   - Vercel automatically deploys frontend updates
   - Render automatically deploys backend updates

### Best Practices
1. Always commit working code
2. Use meaningful commit messages
3. Test locally before committing
4. Monitor deployment logs


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

## Cost Management Tips
1. Use serverless functions to minimize idle time
2. Implement proper caching
3. Monitor bandwidth usage
4. Set up usage alerts in Render dashboard