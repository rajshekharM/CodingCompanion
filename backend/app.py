import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple
from datetime import datetime
import os
from .huggingface import chat
from .document_processor import doc_processor

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

app = FastAPI(title="Python & DSA Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class MessageCreate(MessageBase):
    pass

# In-memory storage
messages: List[Message] = []
message_id_counter = 1

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing uploaded file: {file.filename}")

        # Save file temporarily
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Process the document
        chunks = doc_processor.process_pdf(file_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="No text content found in PDF")

        # Create vector store
        success = doc_processor.create_vector_store()
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create vector store")

        # Clean up
        os.remove(file_path)
        logger.info(f"Document processed successfully. Generated {len(chunks)} chunks.")
        return {"message": "Document processed successfully", "chunks": len(chunks)}

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    return messages

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
                # Get relevant document chunks with similarity scores
                chunk_results = doc_processor.get_relevant_chunks(
                    message.content,
                    k=3,
                    similarity_threshold=0.6  # Adjust threshold as needed
                )

                if chunk_results:
                    logger.info(f"Found {len(chunk_results)} relevant chunks")
                    # Format context with chunks and their similarity scores
                    context_parts = []
                    for i, (chunk, score) in enumerate(chunk_results):
                        context_parts.append(f"[Relevance: {score:.2f}]\n{chunk}")
                    context = "\n\n".join(context_parts)

                    prompt = f"""Using the following relevant sections from uploaded documents, answer the question.
Each section includes a relevance score (0-1) indicating how closely it matches the query.

Relevant Sections:
{context}

Question: {message.content}

Instructions:
1. Use the most relevant sections above to form your answer
2. Cite specific information from the sections when possible
3. If the sections aren't relevant enough, say so and provide a general answer instead
"""
                else:
                    logger.info("No sufficiently relevant chunks found, using general prompt")
                    prompt = message.content

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