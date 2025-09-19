from fastapi import APIRouter, Depends, HTTPException, Cookie, Request
from fastapi.responses import RedirectResponse
from pymongo import MongoClient
from user_auth.core import verify_token
from Integrations.data_schema import MongoIntegration
from config import GOOGLE_CLIENT_ID, REDIRECT_URI, SCOPES, GOOGLE_CLIENT_SECRET, Integrations
import urllib.parse
import requests
import secrets

router_integrate = APIRouter()

# mongodb+srv://ayush224947101:AYUSH21@cluster0.mq8dx3f.mongodb.net/
# Mongo (Structured)
@router_integrate.post("/mongo")
async def connect_mongo(data: MongoIntegration, access_token: str = Cookie(None)):
    # Verify user
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")
    if access_token.startswith("Bearer "):
        access_token = access_token[len("Bearer "):]
    admin_email = verify_token(access_token, HTTPException(status_code=401, detail="Invalid token"))

    # Test MongoDB connection
    try:
        client = MongoClient(data.mongo_uri, serverSelectionTimeoutMS=2000)
        client.admin.command("ping")  # simple check
        client.close()
        return {"message": f"MongoDB connected successfully for {admin_email}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"MongoDB connection failed: {str(e)}")

# Gmail (Unstructured)
@router_integrate.get("/gmail")
async def connect_gmail(request: Request, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")
    if access_token.startswith("Bearer "):
        access_token = access_token[len("Bearer "):]
    
    admin_email = verify_token(access_token, HTTPException(status_code=401, detail="Invalid token"))
    
    # Generate a unique state parameter for CSRF protection
    state = secrets.token_urlsafe(32)
    request.session["oauth_state"] = state
    request.session["admin_email"] = admin_email

    # Generate OAuth URL
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",  # get refresh token
        "prompt": "consent",
        "state": state
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return url

# Gmail OAuth callback
@router_integrate.get("/gmail/callback")
async def gmail_callback(request: Request, code: str):

    # Clear the session variables after validation
    admin_email = request.session.pop("admin_email", None)
    request.session.pop("oauth_state", None)

    if not admin_email:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please try again.")

    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    r = requests.post(token_url, data=payload)
    tokens = r.json()

    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Failed to obtain refresh token")

    # Here, store refresh_token for admin_email in DB
    Integrations.update_one({"admin_email": admin_email}, {"$set": {"gmail_refresh_token": refresh_token}})

    return {"message": "Gmail connected successfully!"}