# Deployment Instructions

## 1. Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project" and select your GitHub repository
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```
5. Click Deploy

## 2. Backend Deployment (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: python-dsa-assistant-backend
   - Environment: Python 3
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Environment Variables:
     ```
     HUGGINGFACE_API_KEY=your_huggingface_api_key
     ```

## 3. Update Frontend with Backend URL

1. After backend is deployed, copy the Render URL
2. Go to Vercel Project Settings
3. Update NEXT_PUBLIC_API_URL with the Render URL

## 4. Verify Deployment

1. Test the chat functionality
2. Try uploading a document
3. Verify RAG responses

## Making Changes After Deployment

### Frontend Changes
1. Make changes locally
2. Push to GitHub
3. Vercel will automatically deploy changes
4. Environment variables can be updated in Vercel Dashboard

### Backend Changes
1. Make changes locally
2. Push to GitHub
3. Render will automatically deploy changes
4. Environment variables can be updated in Render Dashboard

### Important Notes
- Keep sensitive keys in environment variables
- Test changes locally before pushing
- Monitor deployment logs in respective dashboards
- Uploaded files are temporary (implement cloud storage for persistence)
