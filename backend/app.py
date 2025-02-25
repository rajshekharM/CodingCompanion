import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info("Starting FastAPI application")
port = os.environ.get("PORT")
logger.info(f"PORT environment variable: {port}")

# Initialize FastAPI app
app = FastAPI(title="Python & DSA Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
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

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Python & DSA Assistant API"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        logger.info("Health check endpoint called")
        return {
            "status": "healthy",
            "port": os.environ.get("PORT", "Not set"),
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    """Get all messages"""
    logger.info("Fetching messages")
    return messages

@app.post("/api/messages", response_model=List[Message])
async def create_message(message: MessageCreate):
    """Create a new message"""
    global message_id_counter
    try:
        logger.info(f"Creating message with role: {message.role}")
        user_message = Message(
            id=message_id_counter,
            timestamp=datetime.utcnow(),
            **message.dict()
        )
        message_id_counter += 1
        messages.append(user_message)

        # Simple response
        if message.role == "user":
            ai_message = Message(
                id=message_id_counter,
                role="assistant",
                content="Hello! I'm here to help with Python and DSA questions.",
                code_blocks=[],
                timestamp=datetime.utcnow()
            )
            message_id_counter += 1
            messages.append(ai_message)
            return [user_message, ai_message]
        return [user_message]
    except Exception as e:
        logger.error(f"Error creating message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/messages")
async def clear_messages():
    """Clear all messages"""
    global messages, message_id_counter
    logger.info("Clearing all messages")
    messages = []
    message_id_counter = 1
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port)