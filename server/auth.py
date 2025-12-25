# auth.py
import os
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


from fastapi import Request
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow

from config import (
    SCOPES,
    CLIENT_SECRETS_FILE,
    REDIRECT_URI,
    FRONTEND_URL,
    TOKEN_FILE,
)


def google_login():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        include_granted_scopes="true",
    )

    return RedirectResponse(auth_url)


def google_callback(request: Request):
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    flow.fetch_token(authorization_response=str(request.url))
    creds = flow.credentials

    with open(TOKEN_FILE, "w") as f:
        f.write(creds.to_json())

    return RedirectResponse(FRONTEND_URL)
