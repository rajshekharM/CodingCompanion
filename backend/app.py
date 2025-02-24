from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from .huggingface import chat
from .middleware.logging import RequestLogMiddleware
from .document_processor import doc_processor
import logging
import json

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


app = FastAPI(title="Python & DSA Assistant")

# Add logging middleware
app.add_middleware(RequestLogMiddleware)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageBase(BaseModel):
    role: str
    content: str
    code_blocks: List[str] = []

class Message(MessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    role: str
    content: str
    code_blocks: List[str] = []

# In-memory storage
messages: List[Message] = []
message_id_counter = 1

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save file temporarily
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Process the document
        chunks = doc_processor.process_pdf(file_path)
        doc_processor.create_vector_store()

        # Clean up
        os.remove(file_path)

        return {"message": "Document processed successfully"}
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    return sorted(messages, key=lambda x: x.timestamp, reverse=True)

@app.post("/api/messages", response_model=List[Message])
async def create_message(message: MessageCreate):
    global message_id_counter
    try:
        user_message = Message(
            id=message_id_counter,
            timestamp=datetime.utcnow(),
            **message.dict()
        )
        message_id_counter += 1
        messages.append(user_message)

        response_messages = [user_message]

        if message.role == "user":
            try:
                # Get relevant document chunks
                relevant_chunks = doc_processor.get_relevant_chunks(message.content)
                context = "\n".join(relevant_chunks) if relevant_chunks else ""

                # Add context to the prompt if available
                prompt = message.content
                if context:
                    prompt = f"Using this context:\n{context}\n\nUser question: {message.content}"

                ai_response = await chat(prompt)

                ai_message = Message(
                    id=message_id_counter,
                    role="assistant",
                    content=ai_response["content"],
                    code_blocks=ai_response["code_blocks"],
                    timestamp=datetime.utcnow()
                )
                message_id_counter += 1
                messages.append(ai_message)
                response_messages.append(ai_message)
            except Exception as e:
                logger.error(f"AI Response Error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to get AI response: {str(e)}"
                )

        return response_messages
    except Exception as e:
        logger.error(f"Message Creation Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create message: {str(e)}"
        )

@app.delete("/api/messages")
async def clear_messages():
    global messages, message_id_counter
    messages = []
    message_id_counter = 1
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)