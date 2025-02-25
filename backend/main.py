import os
from fastapi import FastAPI
from .app import app as fastapi_app

# Re-export the app
app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)