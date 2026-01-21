import os
import urllib.parse
from datetime import datetime, timedelta
import jwt
import requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
OAUTH_STATE_SECRET = os.getenv("OAUTH_STATE_SECRET", "dev-oauth-secret")

if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI]):
    raise RuntimeError("Google OAuth environment variables not set")

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
]
GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"

STATE_ALGORITHM = "HS256"
STATE_EXPIRE_MINUTES = 10


# ---------- OAuth state ----------
def create_oauth_state(user_id: int) -> str:
    payload = {"user_id": user_id, "exp": datetime.utcnow() + timedelta(minutes=STATE_EXPIRE_MINUTES)}
    return jwt.encode(payload, OAUTH_STATE_SECRET, algorithm=STATE_ALGORITHM)


def verify_oauth_state(state: str) -> dict:
    try:
        return jwt.decode(state, OAUTH_STATE_SECRET, algorithms=[STATE_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise RuntimeError("OAuth state expired")
    except jwt.InvalidTokenError:
        raise RuntimeError("Invalid OAuth state")


# ---------- OAuth flow ----------
def build_gmail_auth_url(state: str) -> str:
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(GMAIL_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)


def exchange_code_for_tokens(code: str) -> dict:
    res = requests.post(
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

    if "access_token" not in res or "refresh_token" not in res:
        raise RuntimeError("OAuth token exchange failed")

    return {
        "access_token": res["access_token"],
        "refresh_token": res["refresh_token"],
        "expires_at": datetime.utcnow() + timedelta(seconds=res["expires_in"]),
    }


def refresh_access_token(refresh_token: str) -> dict:
    """Exchange refresh token for a new access token."""
    print("[GMAIL_UTIL] Refreshing access token")
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    res = requests.post("https://oauth2.googleapis.com/token", data=data, timeout=10)
    res.raise_for_status()
    token_data = res.json()
    print(f"[GMAIL_UTIL] Access token refreshed, expires in {token_data.get('expires_in')} seconds")
    return {
        "access_token": token_data["access_token"],
        "expires_at": datetime.utcnow() + timedelta(seconds=token_data["expires_in"]),
    }


def fetch_google_profile(access_token: str) -> dict:
    res = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    return res.json()


def revoke_gmail_token(refresh_token: str) -> None:
    requests.post(
        "https://oauth2.googleapis.com/revoke",
        params={"token": refresh_token},
        timeout=10,
    )


# ---------- Gmail API ----------
def fetch_gmail_messages(access_token: str, page_token: str | None = None):
    params = {"maxResults": 50}
    if page_token:
        params["pageToken"] = page_token

    print(f"[GMAIL_UTIL] Fetching messages with pageToken={page_token}")
    try:
        res = requests.get(
            f"{GMAIL_API_BASE}/users/me/messages",
            headers={"Authorization": f"Bearer {access_token}"},
            params=params,
            timeout=10,
        )
        print(f"[GMAIL_UTIL] HTTP status: {res.status_code}")
        res.raise_for_status()
        data = res.json()
        print(f"[GMAIL_UTIL] Fetched {len(data.get('messages', []))} messages")
        if "nextPageToken" in data:
            print(f"[GMAIL_UTIL] nextPageToken: {data['nextPageToken']}")
        return data
    except requests.HTTPError as e:
        print(f"[GMAIL_UTIL] HTTP error: {e}")
        return {"messages": []}
    except Exception as e:
        print(f"[GMAIL_UTIL] Unexpected error: {e}")
        return {"messages": []}


def fetch_gmail_message_detail(access_token: str, message_id: str):
    print(f"[GMAIL_UTIL] Fetching details for message {message_id}")
    try:
        res = requests.get(
            f"{GMAIL_API_BASE}/users/me/messages/{message_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"format": "full"},
            timeout=10,
        )
        print(f"[GMAIL_UTIL] HTTP status for message {message_id}: {res.status_code}")
        res.raise_for_status()
        data = res.json()
        return data
    except requests.HTTPError as e:
        print(f"[GMAIL_UTIL] HTTP error fetching message {message_id}: {e}")
        return {}
    except Exception as e:
        print(f"[GMAIL_UTIL] Unexpected error fetching message {message_id}: {e}")
        return {}

