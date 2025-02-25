import logging
import os
import time
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache
from fastapi_cache.backends.inmemory import InMemoryBackend
from pydantic import BaseModel
from typing import List
from datetime import datetime

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup information and environment
logger.info("Initializing FastAPI application")
port = os.environ.get("PORT", "Not set")
python_path = os.environ.get("PYTHONPATH", "Not set")
logger.info(f"Startup environment - PORT: {port}, PYTHONPATH: {python_path}")

app = FastAPI(title="Python & DSA Assistant")

# Enable CORS
origins = ["*"]  # In production, replace with actual frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        FastAPICache.init(InMemoryBackend())
        logger.info("Cache initialization successful")
        # Log all environment variables (excluding sensitive ones)
        env_vars = {k: v for k, v in os.environ.items()
                   if not any(s in k.lower() for s in ['key', 'secret', 'password', 'token'])}
        logger.info(f"Environment variables: {env_vars}")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Request to {request.url.path} completed in {process_time:.2f}s with status {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request to {request.url.path} failed after {time.time() - start_time:.2f}s: {str(e)}")
        raise

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify API is running"""
    try:
        logger.info("Health check endpoint called")
        return {
            "status": "healthy",
            "port": os.environ.get("PORT", "Not set"),
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": os.environ.get("PYTHON_ENV", "development"),
            "python_path": os.environ.get("PYTHONPATH", "Not set")
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class MessageBase(BaseModel):
    role: str
    content: str
    code_blocks: List[str] = []

class Message(MessageBase):
    id: int
    timestamp: datetime

class MessageCreate(MessageBase):
    pass

# In-memory storage
messages: List[Message] = []
message_id_counter = 1

def register_routes(app: FastAPI):
    @app.get("/api/messages", response_model=List[Message])
    async def get_messages():
        try:
            return messages
        except Exception as e:
            logger.error(f"Error fetching messages: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/messages", response_model=List[Message])
    async def create_message(message: MessageCreate):
        global message_id_counter
        try:
            logger.info(f"Creating new message with role: {message.role}")
            user_message = Message(
                id=message_id_counter,
                timestamp=datetime.utcnow(),
                **message.dict()
            )
            message_id_counter += 1
            messages.append(user_message)

            if message.role == "user":
                try:
                    from .huggingface import chat
                    ai_response = await chat(message.content)
                    ai_message = Message(
                        id=message_id_counter,
                        role="assistant",
                        content=ai_response.content,
                        code_blocks=ai_response.code_blocks,
                        timestamp=datetime.utcnow()
                    )
                    message_id_counter += 1
                    messages.append(ai_message)
                    return [user_message, ai_message]
                except Exception as e:
                    logger.error(f"AI Response Error: {str(e)}")
                    raise HTTPException(status_code=500, detail=str(e))
            return [user_message]
        except Exception as e:
            logger.error(f"Message Creation Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.delete("/api/messages")
    async def clear_messages():
        global messages, message_id_counter
        messages = []
        message_id_counter = 1
        return {"status": "success"}

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Request to {request.url.path} took {process_time:.2f} seconds")
        return response

    return app

register_routes(app)

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing file upload: {file.filename}")
        contents = await file.read()
        file_path = f"temp_{file.filename}"

        with open(file_path, "wb") as f:
            f.write(contents)

        from .document_processor import doc_processor
        chunks = doc_processor.process_pdf(file_path)

        if not chunks:
            logger.warning("No text content found in uploaded PDF")
            raise HTTPException(status_code=400, detail="No text content found in PDF")

        success = doc_processor.create_vector_store()
        if not success:
            logger.error("Failed to create vector store")
            raise HTTPException(status_code=500, detail="Failed to create vector store")

        if os.path.exists(file_path):
            os.remove(file_path)

        logger.info(f"Document processed successfully: {len(chunks)} chunks")
        return {"message": "Document processed successfully", "chunks": len(chunks)}

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)