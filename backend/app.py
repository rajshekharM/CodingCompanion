from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
from huggingface_hub import InferenceClient
import os

app = FastAPI(title="Python & DSA Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
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

    class Config:
        from_attributes = True

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
async def create_message(message: MessageBase):
    global message_id_counter, messages
    
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
    uvicorn.run(app, host="0.0.0.0", port=5000)
