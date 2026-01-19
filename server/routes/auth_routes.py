from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db import get_db, User
from auth import (
    hash_password,
    verify_password,
    create_jwt_token,
    get_current_user,
    TOKEN_EXPIRE_DAYS,
)

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400)

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_jwt_token({"user_id": user.id})

    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return {"status": "ok"}

@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401)

    token = create_jwt_token({"user_id": user.id})

    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        max_age=TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return {"status": "ok"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="token", path="/")
    return {"status": "ok"}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
    }
