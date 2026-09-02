from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base
from backend.seed import seed_database
from backend.routers import (
    auth, operations, concierge, analytics, expenses, reviews, pricing, dashboard
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed sample data on startup
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seeding notice: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Unified Hotel Guest Experience & Management Intelligence Platform for a 70-room hotel and residences.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(operations.router)
app.include_router(concierge.router)
app.include_router(analytics.router)
app.include_router(expenses.router)
app.include_router(reviews.router)
app.include_router(pricing.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "hotel": settings.HOTEL_NAME,
        "total_rooms": settings.TOTAL_ROOMS,
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
