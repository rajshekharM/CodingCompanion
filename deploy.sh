#!/bin/bash

echo "Deploying Python & DSA Assistant..."

# Frontend deployment
echo "Step 1: Building and deploying frontend..."
cd frontend
npm run build
vercel deploy --prod

# Backend deployment
echo "Step 2: Deploying backend to Render..."
cd ../backend

# Create a tar archive of the backend
echo "Creating backend archive..."
tar -czf backend.tar.gz ./*

echo "Deployment completed!"
echo "Note: Upload backend.tar.gz to Render manually through the dashboard"
echo "Important: Set up the following environment variables in your deployment platforms:"
echo "- Frontend (Vercel): NEXT_PUBLIC_API_URL, HUGGINGFACE_API_KEY, OPENAI_API_KEY"
echo "- Backend (Render): HUGGINGFACE_API_KEY, OPENAI_API_KEY"