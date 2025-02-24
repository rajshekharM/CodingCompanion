```markdown
# Deployment Guide

## Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Sign up for Vercel (vercel.com)
3. Import your repository
4. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API key

## Backend Deployment (Render)

1. Sign up for Render (render.com)
2. Create a new Web Service
3. Connect your repository
4. Configure environment variables:
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API key
   - Other API keys as needed

## Environment Setup

Create a `.env` file for local development:
```env
HUGGINGFACE_API_KEY=your_key_here
```

## Monitoring Setup

1. Logs are stored in `app.log`
2. Monitor these metrics:
   - Request response times
   - Token usage
   - User sessions
   - Error rates

## Analytics Integration

1. Add Google Analytics:
   ```javascript
   // Add to _app.tsx
   import Script from 'next/script'
   
   export default function App({ Component, pageProps }) {
     return (
       <>
         <Script
           strategy="lazyOnload"
           src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
         />
         <Script strategy="lazyOnload">
           {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
           `}
         </Script>
         <Component {...pageProps} />
       </>
     )
   }
   ```

2. Verify setup in Google Analytics Console

## Deployment Commands

```bash
# Frontend
cd frontend
npm run build
vercel deploy

# Backend
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## Monitoring Dashboard

Access logs at:
- Application logs: `app.log`
- Vercel Analytics Dashboard
- Google Analytics Dashboard
```
