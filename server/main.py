from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes import auth_routes, gmail_routes
from db import Base, engine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(gmail_routes.router)

@app.get("/")
def root():
    return {"message": "Mailwise API is running"}
