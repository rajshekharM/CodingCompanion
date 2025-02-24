from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    app_name: str = "Python & DSA Assistant"
    huggingface_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
