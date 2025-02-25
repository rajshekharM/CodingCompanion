# Python & DSA Assistant

A high-performance AI-powered coding assistant for Python and Data Structures & Algorithms interview preparation, built with modern web technologies for enhanced scalability and user experience.

```ascii
+------------------+     +-----------------+     +------------------+
|                  |     |                 |     |                  |
|  Next.js Frontend|     |  FastAPI Backend|     |   AI Services   |
|                  |     |                 |     |                  |
|  - React         |     |  - Python       |     | - HuggingFace   |
|  - TypeScript    |<--->|  - In-Memory DB |<--->| - Code LLaMA    |
|  - TailwindCSS   |     |  - WebSocket    |     |                  |
|  - React Query   |     |  - Pydantic     |     |                  |
|                  |     |                 |     |                  |
+------------------+     +-----------------+     +------------------+
```

## Replit-GitHub Sync Setup

1. In Replit:
   - Open your project
   - Click on "Version Control" in the left sidebar
   - Click "Connect to GitHub"
   - Select your repository
   - Authorize Replit

2. Auto-sync will now:
   - Push changes when you commit in Replit
   - Trigger deployments on Vercel (frontend)
   - Trigger deployments on Render (backend)

## Architecture Overview

### Frontend (Next.js)
- **Technology**: Next.js with TypeScript
- **Key Components**:
  - React for UI components
  - TailwindCSS for styling
  - React Query for state management
  - Shadcn UI components for consistent design
  - Syntax highlighting for code blocks

### Backend (FastAPI)
- **Technology**: FastAPI with Python 3.11
- **Key Features**:
  - RESTful API endpoints
  - In-memory message storage
  - Async request handling
  - Type validation with Pydantic
  - Code execution sandbox

### AI Integration
- **Models**: Code LLaMA (HuggingFace)
- **Features**:
  - Python code generation
  - Code explanation
  - DSA concept clarification
  - Time/space complexity analysis

## Continuous Integration/Deployment Pipeline

### 1. Development (Replit)
- All development happens in Replit
- Code changes are automatically committed
- Commits trigger GitHub sync

### 2. Version Control (GitHub)
- Acts as the central repository
- Maintains version history
- Triggers deployment pipelines

### 3. Frontend Deployment (Vercel)
- Automatic deployments on push
- Environment variables managed in Vercel dashboard
- Global CDN distribution
- Automatic HTTPS

### 4. Backend Deployment (Render)
- Automatic deployments from GitHub
- Environment variables in Render dashboard
- Horizontal scaling capabilities
- Automatic HTTPS

### 5. Monitoring
- Vercel Analytics for frontend
- Render Dashboard for backend
- Health check endpoints
- Error tracking and logging

## Development Workflow

1. Make changes in Replit
2. Test locally using `npm run dev`
3. Commit changes in Replit
4. Changes automatically sync to GitHub
5. Deployments trigger automatically:
   - Frontend deploys to Vercel
   - Backend deploys to Render

## Key Features
1. **Interactive Chat Interface**
   - Real-time code generation
   - Syntax highlighted code blocks
   - Copy-to-clipboard functionality

2. **Code Execution**
   - Secure Python code execution
   - Output display
   - Error handling

3. **Responsive Design**
   - Mobile-friendly interface
   - Dark mode support
   - Accessibility features

## Technical Implementation

### Data Flow
1. User submits a question through the chat interface
2. Frontend sends request to FastAPI backend
3. Backend processes request and calls AI service
4. AI generates response with code examples
5. Response is formatted and sent back to frontend
6. Frontend renders response with syntax highlighting

### State Management
- React Query for API state management
- In-memory storage for chat history
- Optimistic updates for better UX

### Code Execution
- Sandboxed Python environment
- Resource usage limits
- Timeout protection

## Future Enhancements

### Planned Features
1. **Authentication & Personalization**
   - User accounts
   - Saved chat history
   - Favorite code snippets

2. **Advanced Code Features**
   - Multiple language support
   - Interactive code editor
   - Unit test generation
   - Code optimization suggestions

3. **Learning Features**
   - Progress tracking
   - Practice problems
   - Performance analytics
   - Custom learning paths

4. **Collaboration**
   - Code sharing
   - Real-time collaboration
   - Community features

5. **Enhanced AI Capabilities**
   - Multiple AI model support
   - Custom model fine-tuning
   - Context-aware responses
   - Advanced code analysis

### Infrastructure Improvements
1. **Scalability**
   - Database integration
   - Caching layer
   - Load balancing
   - Horizontal scaling

2. **Performance**
   - Response time optimization
   - Resource usage optimization
   - Caching strategies
   - CDN integration

3. **Monitoring**
   - Analytics integration
   - Error tracking
   - Performance monitoring
   - Usage statistics

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- HuggingFace API key

### Installation
1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Set up environment variables
5. Run development servers: `python dev.py`

## Deployment
The application can be deployed on various platforms:

1. **Vercel (Recommended)**
   - Optimized for Next.js
   - Excellent performance
   - Free tier available
   - Built-in analytics

2. **Render**
   - Good for full-stack applications
   - Automatic deployments
   - Free tier available

3. **Railway**
   - Full-stack deployment
   - Good performance
   - Free tier available