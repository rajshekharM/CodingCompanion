from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os
from huggingface_hub import InferenceClient
from .middleware.logging import RequestLogMiddleware
import tiktoken
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

# Initialize tokenizer for counting tokens
tokenizer = tiktoken.get_encoding("cl100k_base")

def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text))

# Models
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

# Initialize HuggingFace client
client = InferenceClient(token=os.environ["HUGGINGFACE_API_KEY"])

async def get_ai_response(user_message: str):
    system_prompt = """You are a helpful coding assistant specializing in Python and Data Structures & Algorithms (DSA)."""
    prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:"

    try:
        response = await client.text_generation(
            prompt,
            model="codellama/CodeLlama-34b-Instruct-hf",
            max_new_tokens=1000,
            temperature=0.7,
            return_full_text=False
        )

        # Extract code blocks and content
        text = response.generated_text
        import re
        code_blocks = []
        code_pattern = r"```python([\s\S]*?)```"
        matches = re.finditer(code_pattern, text)
        content = text

        for match in matches:
            code_blocks.append(match.group(1).strip())
            content = content.replace(match.group(0), "")

        content = content.replace("```", "").strip()

        return {"content": content, "code_blocks": code_blocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    return sorted(messages, key=lambda x: x.timestamp, reverse=True)

@app.post("/api/messages", response_model=List[Message])
async def create_message(message: MessageCreate):
    try:
        # Count input tokens
        input_tokens = count_tokens(message.content)

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
                ai_response = await get_ai_response(message.content)

                # Count output tokens
                output_tokens = count_tokens(ai_response["content"])

                # Log token usage
                logger.info(json.dumps({
                    "message_id": user_message.id,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens
                }))

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