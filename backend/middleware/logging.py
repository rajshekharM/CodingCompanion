```python
from fastapi import Request
import time
import uuid
from typing import Callable
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class RequestLogMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, request: Request, call_next: Callable):
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Start timer
        start_time = time.time()
        
        # Get client info
        client_host = request.client.host if request.client else "unknown"
        
        # Create session ID if not exists
        if "session_id" not in request.session:
            request.session["session_id"] = str(uuid.uuid4())

        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log the request
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id,
            "session_id": request.session.get("session_id"),
            "method": request.method,
            "path": request.url.path,
            "client_host": client_host,
            "process_time_ms": round(process_time * 1000, 2),
            "status_code": response.status_code
        }
        
        # Add extra info for chat endpoints
        if request.url.path == "/api/messages" and request.method == "POST":
            body = await request.json()
            log_data.update({
                "message_type": "chat",
                "role": body.get("role"),
                "content_length": len(body.get("content", "")),
            })
        
        logger.info(json.dumps(log_data))
        
        return response
```
