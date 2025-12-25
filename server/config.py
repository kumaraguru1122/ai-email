# config.py
import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")
CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRETS")

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
TOKEN_FILE = "token.json"

REDIRECT_URI = f"{BACKEND_URL}/auth/callback"

if not all([FRONTEND_URL, BACKEND_URL, CLIENT_SECRETS_FILE]):
    raise RuntimeError("Missing required environment variables")
