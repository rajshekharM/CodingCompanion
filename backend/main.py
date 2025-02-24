from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from .huggingface import get_ai_response

app = FastAPI(title="Python & DSA Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class MessageBase(BaseModel):
    role: str
    content: str
    code_blocks: List[str] = []

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# In-memory storage
messages: List[Message] = []
message_id_counter = 1

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    return sorted(messages, key=lambda x: x.timestamp, reverse=True)

@app.post("/api/messages", response_model=List[Message])
async def create_message(message: MessageCreate):
    global message_id_counter
    
    # Create user message
    user_message = Message(
        id=message_id_counter,
        timestamp=datetime.utcnow(),
        **message.dict()
    )
    message_id_counter += 1
    messages.append(user_message)
    
    response_messages = [user_message]
    
    # If it's a user message, get AI response
    if message.role == "user":
        try:
            ai_response = await get_ai_response(message.content)
            ai_message = Message(
                id=message_id_counter,
                role="assistant",
                content=ai_response.content,
                code_blocks=ai_response.code_blocks,
                timestamp=datetime.utcnow()
            )
            message_id_counter += 1
            messages.append(ai_message)
            response_messages.append(ai_message)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get AI response: {str(e)}"
            )
    
    return response_messages

@app.delete("/api/messages")
async def clear_messages():
    global messages, message_id_counter
    messages = []
    message_id_counter = 1
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
