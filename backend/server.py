import os
import sys
import logging
import uvicorn
from . import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    # Log environment information
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")
    logger.info(f"PORT: {os.environ.get('PORT', 'Not set')}")

    # Get port from environment
    try:
        port = int(os.environ.get("PORT", 8000))
    except ValueError:
        logger.error("Invalid PORT value")
        port = 8000

    logger.info(f"Starting server on port {port}")
    
    # Start server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )

if __name__ == "__main__":
    main()
