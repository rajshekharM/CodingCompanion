from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Pydantic models for API
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

# Response Models
class AIResponse(BaseModel):
    content: str
    code_blocks: List[str] = []
