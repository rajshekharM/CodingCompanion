from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from .database import SessionLocal, engine, Base
from .models import Message, MessageCreate, AIResponse
from .config import get_settings
from .huggingface import get_ai_response

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Python & DSA Assistant API")
settings = get_settings()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/messages", response_model=List[Message])
async def get_messages(db: Session = Depends(get_db)):
    from .database import MessageModel
    messages = db.query(MessageModel).order_by(MessageModel.timestamp.desc()).all()
    return messages

@app.post("/api/messages", response_model=List[Message])
async def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    try:
        from .database import MessageModel

        # Create user message
        db_message = MessageModel(
            role=message.role,
            content=message.content,
            code_blocks=message.code_blocks,
            timestamp=datetime.utcnow()
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)

        messages = [db_message]

        # If it's a user message, get AI response
        if message.role == "user":
            try:
                ai_response = await get_ai_response(message.content)
                ai_message = MessageModel(
                    role="assistant",
                    content=ai_response.content,
                    code_blocks=ai_response.code_blocks,
                    timestamp=datetime.utcnow()
                )
                db.add(ai_message)
                db.commit()
                db.refresh(ai_message)
                messages.append(ai_message)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get AI response: {str(e)}"
                )

        return messages
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create message: {str(e)}"
        )

@app.delete("/api/messages")
async def clear_messages(db: Session = Depends(get_db)):
    try:
        from .database import MessageModel
        db.query(MessageModel).delete()
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear messages: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)