from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat
from app.core.config import settings

app = FastAPI(
    title="Dinero Sabio AI Service",
    description="Streaming AI Mentor endpoint for the Dinero Sabio financial education platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origin],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}