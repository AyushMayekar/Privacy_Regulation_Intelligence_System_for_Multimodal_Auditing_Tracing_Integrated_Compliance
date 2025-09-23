from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse
from user_auth.core import extract_and_verify_token
from integrations.data_schema import MongoIntegration
from integrations.core import MongoConnection, GmailConnection, GmailCallback

router_integrate = APIRouter()

# mongodb+srv://ayush224947101:AYUSH21@cluster0.mq8dx3f.mongodb.net/
# Mongo (Structured)
@router_integrate.post("/mongo")
async def connect_mongo(data: MongoIntegration, admin_email: str = Depends(extract_and_verify_token)):

    # Call core function to handle MongoDB connection
    result = MongoConnection(data.mongo_uri, admin_email)
    
    if result["success"]:
        return {"message": result["message"]}
    else:
        raise HTTPException(status_code=400, detail=result["message"])

# Gmail (Unstructured)
@router_integrate.get("/gmail")
async def connect_gmail(request: Request, admin_email: str = Depends(extract_and_verify_token)):
    
    # Call core function to generate OAuth URL
    result = GmailConnection(admin_email)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    # Store state and admin_email in session for callback verification
    request.session["oauth_state"] = result["state"]
    request.session["admin_email"] = admin_email
    
    return RedirectResponse(result["oauth_url"])
    # return result["oauth_url"]

# Gmail OAuth callback
@router_integrate.get("/gmail/callback")
async def gmail_callback(request: Request, code: str):
    # Clear the session variables after validation
    admin_email = request.session.pop("admin_email", None)
    request.session.pop("oauth_state", None)

    if not admin_email:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please try again.")

    # Call core function to handle OAuth callback
    result = GmailCallback(code, admin_email)
    
    if result["success"]:
        return {"message": result["message"]}
    else:
        raise HTTPException(status_code=400, detail=result["message"])