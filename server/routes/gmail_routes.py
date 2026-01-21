from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.auth_utils import get_current_user
from utils.gmail_utils import (
    build_gmail_auth_url,
    exchange_code_for_tokens,
    fetch_google_profile,
    revoke_gmail_token,
    create_oauth_state,
    verify_oauth_state,
    fetch_gmail_messages,
    fetch_gmail_message_detail,
    refresh_access_token,
)

from db import User, GmailAccount, GmailToken, GmailMessage, get_db

router = APIRouter(prefix="/gmail", tags=["gmail"])


# ---------- Connect Gmail ----------
@router.post("/connect")
def connect_gmail(current_user: User = Depends(get_current_user)):
    state = create_oauth_state(user_id=current_user.id)
    auth_url = build_gmail_auth_url(state)
    print(f"[GMAIL] User {current_user.id} initiating OAuth connect")
    return {"auth_url": auth_url}


# ---------- OAuth callback ----------
@router.get("/callback")
def gmail_callback(code: str, state: str, db: Session = Depends(get_db)):
    print("[GMAIL] OAuth callback received")
    payload = verify_oauth_state(state)
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(400, "Invalid OAuth state")

    token_data = exchange_code_for_tokens(code)
    profile = fetch_google_profile(token_data["access_token"])
    google_email = profile.get("email")
    if not google_email:
        raise HTTPException(400, "Failed to fetch Google account email")

    existing = db.query(GmailAccount).filter(
        GmailAccount.user_id == user_id, GmailAccount.google_email == google_email
    ).first()
    if existing:
        print(f"[GMAIL] Account {google_email} already connected")
        return {"status": "already_connected"}

    gmail_account = GmailAccount(user_id=user_id, google_email=google_email)
    db.add(gmail_account)
    db.commit()
    db.refresh(gmail_account)

    gmail_token = GmailToken(
        gmail_account_id=gmail_account.id,
        access_token=token_data["access_token"],
        refresh_token=token_data["refresh_token"],
        expires_at=token_data["expires_at"],
    )
    db.add(gmail_token)
    db.commit()

    print(f"[GMAIL] Connected Gmail account {google_email} for user {user_id}")
    return {"status": "connected", "email": google_email}


# ---------- Sync Gmail messages ----------
@router.post("/sync")
def sync_gmail_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    gmail = db.query(GmailAccount).filter(GmailAccount.user_id == current_user.id).first()
    if not gmail or not gmail.gmail_token:
        raise HTTPException(400, "Gmail not connected")

    token = gmail.gmail_token

    # Refresh token if expired
    if token.expires_at < datetime.utcnow():
        print(f"[GMAIL] Access token expired, refreshing...")
        new_token = refresh_access_token(token.refresh_token)
        token.access_token = new_token["access_token"]
        token.expires_at = new_token["expires_at"]
        db.commit()

    page_token = None
    stored = 0
    print(f"[GMAIL] Starting sync for user {current_user.id}, account {gmail.google_email}")

    while True:
        data = fetch_gmail_messages(token.access_token, page_token)
        messages = data.get("messages", [])
        print(f"[GMAIL] Fetched {len(messages)} messages from Gmail API")

        for msg_ref in messages:
            exists = db.query(GmailMessage).filter(
                GmailMessage.gmail_account_id == gmail.id,
                GmailMessage.gmail_message_id == msg_ref["id"]
            ).first()
            if exists:
                continue

            detail = fetch_gmail_message_detail(token.access_token, msg_ref["id"])
            internal_date = datetime.utcfromtimestamp(int(detail.get("internalDate", 0)) / 1000)

            message = GmailMessage(
                gmail_account_id=gmail.id,
                gmail_message_id=detail["id"],
                thread_id=detail["threadId"],
                snippet=detail.get("snippet"),
                internal_date=internal_date,
                payload=detail,
            )
            db.add(message)
            stored += 1
            print(f"[GMAIL] Stored message {detail['id']}")

        db.commit()
        print(f"[GMAIL] Committed batch of messages, total stored so far: {stored}")

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    print(f"[GMAIL] Sync complete for {gmail.google_email}, total new messages: {stored}")
    return {"status": "synced", "stored": stored}

@router.get("/messages")
def list_gmail_messages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db), limit: int = 50, offset: int = 0):
    print(f"[GMAIL] list_gmail_messages called for user {current_user.id}")
    gmail = db.query(GmailAccount).filter(GmailAccount.user_id == current_user.id).first()
    if not gmail:
        print("[GMAIL] No Gmail account found for user")
        raise HTTPException(400, "Gmail not connected")

    messages = db.query(GmailMessage).filter(
        GmailMessage.gmail_account_id == gmail.id
    ).order_by(GmailMessage.internal_date.desc()).offset(offset).limit(limit).all()

    print(f"[GMAIL] Returning {len(messages)} messages for user {current_user.id}")
    return [
        {
            "id": m.gmail_message_id,
            "thread_id": m.thread_id,
            "snippet": m.snippet,
            "date": m.internal_date,
        }
        for m in messages
    ]

