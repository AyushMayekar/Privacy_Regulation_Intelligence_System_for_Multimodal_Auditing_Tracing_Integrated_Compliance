from pymongo import MongoClient
from config import Integrations
import requests
import urllib.parse
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI, SCOPES
import secrets
from passlib.context import CryptContext

# Initialize password context for encryption (same as user_auth)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def MongoConnection(mongo_uri: str, admin_email: str):
    """
    Handle MongoDB connection and store connection details in database
    
    Args:
        mongo_uri: MongoDB connection string
        admin_email: Admin email for user identification
        
    Returns:
        dict: Success message or error details
    """
    try:
        # Test MongoDB connection
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        client.admin.command("ping")  # simple check
        client.close()
        
        # Encrypt MongoDB URI before storing
        encrypted_mongo_uri = pwd_context.hash(mongo_uri)
        
        # Store connection details in Integrations collection
        Integrations.update_one(
            {"admin_email": admin_email}, 
            {
                "$set": {
                    "encrypted_mongo_uri": encrypted_mongo_uri,
                    "MongoConnection": True
                }
            },
            upsert=True
        )
        
        return {"success": True, "message": f"MongoDB connected successfully for {admin_email}"}
        
    except Exception as e:
        # Encrypt MongoDB URI before storing (even on failure)
        encrypted_mongo_uri = pwd_context.hash(mongo_uri)
        
        # Mark connection as failed
        Integrations.update_one(
            {"admin_email": admin_email}, 
            {
                "$set": {
                    "encrypted_mongo_uri": encrypted_mongo_uri,
                    "MongoConnection": False
                }
            },
            upsert=True
        )
        
        return {"success": False, "message": f"MongoDB connection failed: {str(e)}"}

def GmailConnection(admin_email: str):
    """
    Generate Gmail OAuth URL for connection
    
    Args:
        admin_email: Admin email for user identification
        
    Returns:
        dict: OAuth URL and state for Gmail connection
    """
    try:
        # Generate a unique state parameter for CSRF protection
        state = secrets.token_urlsafe(32)
        
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
        
        oauth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        
        return {
            "success": True, 
            "oauth_url": oauth_url, 
            "state": state,
            "admin_email": admin_email
        }
        
    except Exception as e:
        return {"success": False, "message": f"Failed to generate Gmail OAuth URL: {str(e)}"}

def GmailCallback(code: str, admin_email: str):
    """
    Handle Gmail OAuth callback and store refresh token
    
    Args:
        code: Authorization code from OAuth callback
        admin_email: Admin email for user identification
        
    Returns:
        dict: Success message or error details
    """
    try:
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        response = requests.post(token_url, data=payload)
        tokens = response.json()
        
        refresh_token = tokens.get("refresh_token")
        if not refresh_token:
            return {"success": False, "message": "Failed to obtain refresh token"}
        
        # Encrypt refresh token before storing
        encrypted_refresh_token = pwd_context.hash(refresh_token)
        
        # Store refresh token and mark Gmail connection as successful
        Integrations.update_one(
            {"admin_email": admin_email}, 
            {
                "$set": {
                    "encrypted_gmail_refresh_token": encrypted_refresh_token,
                    "GmailConnection": True
                }
            },
            upsert=True
        )
        
        return {"success": True, "message": "Gmail connected successfully!"}
        
    except Exception as e:
        # Mark Gmail connection as failed
        Integrations.update_one(
            {"admin_email": admin_email}, 
            {
                "$set": {
                    "GmailConnection": False
                }
            },
            upsert=True
        )
        
        return {"success": False, "message": f"Gmail connection failed: {str(e)}"}