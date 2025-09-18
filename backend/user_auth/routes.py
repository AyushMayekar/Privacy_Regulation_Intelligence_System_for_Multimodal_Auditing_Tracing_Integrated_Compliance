from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from backend.user_auth.core import verify_token, Secret_key, algo, oauth2, create_access_token, register_user, login_for_access_token, Users, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
from backend.user_auth.data_schema import UserCreate
from jose import JWTError, jwt
from datetime import timedelta
import httpx
import os

router = APIRouter()

'''
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"
'''

# Register a new user
@router.post("/register", status_code=201)
async def register(user: UserCreate):
    existing_user = Users.find_one({"username": user.username.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = await register_user(
        user.username,
        user.password,
        user.dob,
        user.profession,
        user.address,
        user.pincode,
        user.contact_number,
        user.email,
        user.latitude,
        user.longitude,)

    return {"message": "User registered successfully"}

# Oauth
'''
@router.post("/google-login")
async def google_login(response: Response, code: str):
    # Exchange code for tokens
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": "postmessage",  # For server-side flow
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data=data)
        token_resp.raise_for_status()
        tokens = token_resp.json()
    
        # Fetch user info
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}
        userinfo_resp = await client.get(GOOGLE_USERINFO_URL, headers=headers)
        userinfo_resp.raise_for_status()
        user_info = userinfo_resp.json()
    
    email = user_info.get("email")
    username = email.split("@")[0].lower()
    
    user = Users.find_one({"email": email})
    if not user:
        # Auto-register user from Google profile
        Users.insert_one({
            "username": username,
            "hashed_password": "",  # No password since OAuth
            "dob": "",
            "profession": "",
            "address": "",
            "pincode": "",
            "contact_number": "",
            "email": email,
            "location": {"type": "Point", "coordinates": [0.0, 0.0]}
        })
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": username}, expires_delta=access_token_expires)
    refresh_token = create_access_token(data={"sub": username}, expires_delta=refresh_token_expires)
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return {"message": "Google OAuth login successful", "access_token": access_token}
'''

@router.get("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    if not refresh_token: 
        raise HTTPException(status_code=403, detail='Refresh token not found!!')
    try:
        payload = jwt.decode(refresh_token, Secret_key, algorithms=[algo])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=403, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=403, detail="refresh token expired, login Again!!")

    # Generate new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(data={"sub": username}, expires_delta=access_token_expires)

    return new_access_token

# User login and token generation
@router.post("/token")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_for_access_token(response, form_data)

# Protected route example: Only accessible with valid token
@router.get("/protected")
async def protected(response:Response, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # print(f"Received token: {token}")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if access_token.startswith("Bearer "):
        access_token = access_token[len("Bearer "):]
    
    try:
        username = verify_token(access_token, credentials_exception)
    except HTTPException as e:
        if e.status_code == 401 and "expired" in str(e.detail):
            # Attempt to refresh the token
            new_access_token = await refresh_token()
            # Optionally, set the new access token in the cookies
            response.set_cookie(key="access_token", value=f"Bearer {new_access_token}", httponly=True, secure=True, samesite='lax')
            username = verify_token(new_access_token, credentials_exception) 
        else:
            raise e
    user = Users.find_one({"username": username})
    if not user:
        raise credentials_exception
    
    return {"message": 'Authenticated' }

# Logout
@router.post("/logout")
async def logout(response: Response, access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # print(f"Received token: {token}")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if access_token.startswith("Bearer "):
        access_token = access_token[len("Bearer "):]
    
    try:
        username = verify_token(access_token, credentials_exception)
    except HTTPException as e:
        if e.status_code == 401 and "expired" in str(e.detail):
            # Attempt to refresh the token
            new_access_token = await refresh_token()
            # Optionally, set the new access token in the cookies
            response.set_cookie(key="access_token", value=f"Bearer {new_access_token}", httponly=True, secure=True, samesite='lax')
            username = verify_token(new_access_token, credentials_exception) 
        else:
            raise e
    user = Users.find_one({"username": username})
    if not user:
        raise credentials_exception

    # Clear the access token cookie by setting it with an expired time
    response.delete_cookie("access_token")
    
    return {"message": "Successfully logged out"}