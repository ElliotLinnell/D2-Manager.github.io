from fastapi import FastAPI, HTTPException, Depends
import requests
from pydantic import BaseSettings
from starlette.requests import Request
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()
class Settings(BaseSettings):
    BUNGIE_CLIENT_ID: str
    BUNGIE_CLIENT_SECRET: str
    BUNGIE_API_KEY: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()

# Bungie API credentials
CLIENT_ID = settings.BUNGIE_CLIENT_ID
CLIENT_SECRET = settings.BUNGIE_CLIENT_SECRET
API_KEY = settings.BUNGIE_API_KEY
DATABASE_URL = settings.DATABASE_URL
REDIRECT_URI = "http://localhost:3000/auth/callback"

TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/"
AUTH_URL = f"https://www.bungie.net/en/oauth/authorize?client_id={CLIENT_ID}&response_type=code"

# Database setup
DATABASE_URL = config("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    bungie_id = Column(String, unique=True, index=True)
    display_name = Column(String)
    membership_type = Column(Integer)

class Token(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True, index=True)
    bungie_id = Column(String, unique=True, index=True)
    access_token = Column(String)
    refresh_token = Column(String)

Base.metadata.create_all(bind=engine)

@app.get("/login")
def login():
    """Redirects user to Bungie OAuth login."""
    return {"login_url": AUTH_URL}

@app.get("/auth/callback")
def auth_callback(request: Request, code: str):
    """Handles OAuth2 callback and exchanges code for access token."""
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(TOKEN_URL, data=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="OAuth token exchange failed")
    
    return response.json()

@app.get("/profile")
def get_profile(access_token: str):
    """Fetches Destiny 2 profile and inventory."""
    url = "https://www.bungie.net/Platform/Destiny2/Manifest/"
    headers = {"X-API-Key": API_KEY, "Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch profile")
    
    return response.json()
