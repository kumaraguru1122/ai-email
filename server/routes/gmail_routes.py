import os
import urllib.parse
from datetime import datetime, timedelta

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db, User, GmailAccount, GmailToken
from auth import get_current_user

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI]):
    raise RuntimeError("Google OAuth env vars not set")

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]

router = APIRouter(prefix="/gmail", tags=["gmail"])

@router.post("/connect")
def connect_gmail(current_user: User = Depends(get_current_user)):
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": str(current_user.id),
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return {"auth_url": auth_url}

@router.get("/callback")
def gmail_callback(code: str, state: str, db: Session = Depends(get_db)):
    try:
        user_id = int(state)
    except ValueError:
        raise HTTPException(400, "Invalid state")

    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        },
        timeout=10,
    ).json()

    if "access_token" not in token_res:
        raise HTTPException(400, "OAuth token exchange failed")

    access_token = token_res["access_token"]
    refresh_token = token_res.get("refresh_token")
    expires_at = datetime.utcnow() + timedelta(seconds=token_res["expires_in"])

    if not refresh_token:
        raise HTTPException(400, "Refresh token not returned")

    profile = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    ).json()

    google_email = profile.get("email")
    if not google_email:
        raise HTTPException(400, "Failed to fetch Gmail address")

    existing = db.query(GmailAccount).filter(
        GmailAccount.user_id == user_id,
        GmailAccount.google_email == google_email
    ).first()
    if existing:
        return {"status": "already_connected"}

    gmail_account = GmailAccount(user_id=user_id, google_email=google_email)
    db.add(gmail_account)
    db.commit()
    db.refresh(gmail_account)

    gmail_token = GmailToken(
        gmail_account_id=gmail_account.id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_at=expires_at,
    )
    db.add(gmail_token)
    db.commit()

    return {"status": "connected"}

@router.post("/disconnect")
def disconnect_gmail(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    gmail = db.query(GmailAccount).filter(GmailAccount.user_id == current_user.id).first()
    if not gmail:
        raise HTTPException(404, "No Gmail account connected")

    token = db.query(GmailToken).filter(GmailToken.gmail_account_id == gmail.id).first()
    if token:
        requests.post(
            "https://oauth2.googleapis.com/revoke",
            params={"token": token.refresh_token},
            timeout=10,
        )

    db.delete(gmail)
    db.commit()
    return {"status": "disconnected"}

@router.get("/status")
def gmail_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    gmail_account = db.query(GmailAccount).filter(GmailAccount.user_id == current_user.id).first()
    if gmail_account:
        return {"connected": True, "email": gmail_account.google_email}
    return {"connected": False, "email": ""}

def get_gmail_access_token(db: Session, gmail_account_id: int) -> str:
    token = db.query(GmailToken).filter(GmailToken.gmail_account_id == gmail_account_id).first()
    if not token:
        raise RuntimeError("Gmail token not found")

    if token.expires_at > datetime.utcnow():
        return token.access_token

    res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": token.refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=10,
    ).json()

    if "access_token" not in res:
        raise RuntimeError("Failed to refresh Gmail token")

    token.access_token = res["access_token"]
    token.expires_at = datetime.utcnow() + timedelta(seconds=res["expires_in"])
    db.commit()
    return token.access_token

