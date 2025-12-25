import os
import base64
from fastapi import HTTPException
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from config import SCOPES, TOKEN_FILE


def get_gmail_service():
    if not os.path.exists(TOKEN_FILE):
        raise HTTPException(status_code=401, detail="Not authenticated")

    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    return build("gmail", "v1", credentials=creds)


def decode_plain_text(payload):
    body = payload.get("body", {})
    data = body.get("data")

    if data:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

    for part in payload.get("parts", []):
        if part.get("mimeType") == "text/plain":
            return decode_plain_text(part)

    return ""


def fetch_emails(limit: int = 10):
    service = get_gmail_service()

    result = service.users().messages().list(
        userId="me",
        maxResults=limit,
    ).execute()

    messages = result.get("messages", [])
    emails = []

    for msg in messages:
        full = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="full",
        ).execute()

        headers = {
            h["name"]: h["value"]
            for h in full["payload"].get("headers", [])
        }

        emails.append({
            "id": msg["id"],
            "thread_id": full.get("threadId"),
            "from": headers.get("From", ""),
            "to": headers.get("To", ""),
            "subject": headers.get("Subject", ""),
            "date": headers.get("Date", ""),
            "snippet": full.get("snippet", ""),
            "body": decode_plain_text(full["payload"]),
        })

    return emails
