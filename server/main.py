# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_URL
from auth import google_login, google_callback
from gmail import fetch_emails

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.get("/auth/google/login")(google_login)
app.get("/auth/callback")(google_callback)
app.get("/api/emails")(fetch_emails)
