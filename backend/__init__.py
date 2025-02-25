"""
Python & DSA Assistant Backend
"""

from fastapi import FastAPI
app = FastAPI(title="Python & DSA Assistant")

from .main import setup_routes
setup_routes(app)