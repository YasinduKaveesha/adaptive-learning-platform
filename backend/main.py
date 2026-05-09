"""
Component A — Diagnostic Engine  |  FastAPI Application Entry Point

Run locally:
    cd backend
    uvicorn main:app --reload --port 8000

API base: http://localhost:8000/api/v1/
Swagger UI: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1 import screening
from core.classifier import ScreeningClassifier


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Train classifier once at startup (~1 second)
    clf = ScreeningClassifier()
    clf.train()
    app.state.classifier = clf
    print("✅ Classifier trained on 1 000 synthetic students.")
    yield
    # Cleanup (nothing needed for in-memory store)


app = FastAPI(
    title="Component A — Diagnostic Engine",
    description=(
        "Adaptive cognitive screening engine for R26-IT-088. "
        "Uses Thompson Sampling + IRT 2PL to classify students "
        "into Group A / B / C with per-domain cognitive profile."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React Native app (Expo) to reach the API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(screening.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "component": "A", "version": "1.0.0"}
