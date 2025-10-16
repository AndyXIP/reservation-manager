from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api import api_router

app = FastAPI(
    title="Reservation Manager API",
    description="A simple FastAPI backend for managing reservations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Reservation Manager API!"}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)