import os
from datetime import datetime
from dotenv import load_dotenv

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base,
    relationship,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


# ---------- DB session dependency ----------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- User (app identity) ----------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    gmail_accounts = relationship(
        "GmailAccount",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ---------- Gmail account (external identity) ----------

class GmailAccount(Base):
    __tablename__ = "gmail_accounts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    google_email = Column(String, nullable=False)
    connected_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="gmail_accounts")
    token = relationship(
        "GmailToken",
        back_populates="gmail_account",
        uselist=False,
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("user_id", "google_email", name="uq_user_gmail"),
    )


# ---------- Gmail OAuth tokens ----------

class GmailToken(Base):
    __tablename__ = "gmail_tokens"

    gmail_account_id = Column(
        Integer,
        ForeignKey("gmail_accounts.id", ondelete="CASCADE"),
        primary_key=True,
    )
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    gmail_account = relationship("GmailAccount", back_populates="token")

