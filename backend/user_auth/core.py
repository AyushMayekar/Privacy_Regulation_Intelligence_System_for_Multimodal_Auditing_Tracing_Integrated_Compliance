import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, Response
from config import Users
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional
from passlib.context import CryptContext
from dotenv import load_dotenv
from pydantic import EmailStr

load_dotenv()
Secret_key = os.getenv('Secret_key')
algo = 'HS256'

# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 525600

# hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl='token')

# Creating token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp':expire})
    encoded_jwt = jwt.encode(to_encode, Secret_key, algorithm=algo)
    return encoded_jwt

# verifying token 
def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, Secret_key, algorithms=[algo])
        admin_email: str = payload.get("sub")
        if admin_email is None:
            raise credentials_exception
        return admin_email
    except JWTError as e:
        if "expired" in str(e):
            raise HTTPException(status_code=401, detail="Access token has expired.")
        raise credentials_exception

def hash_password(password: str):
    return pwd_context.hash(password)

# verifying passwords
def verify_password(plain_password:str, hashed_password:str):
    return pwd_context.verify(plain_password, hashed_password)

# authenticate user
async def authenticate_user (admin_email: EmailStr, password: str) :
    admin_email = admin_email.lower()
    user = Users.find_one({'admin_email': admin_email})
    if user and verify_password(password, user.get('hashed_password', "")):
        return user
    return None

# register user
async def register_user (
    org_name: str,                
    admin_name: str,             
    admin_email: EmailStr,       
    password: str,    
    ):
    hashed_password = hash_password(password)
    user = Users.insert_one({
        'org_name': org_name,
        'admin_name':admin_name,
        'admin_email': admin_email,
        'hashed_password':hashed_password,
            })
    return user

# login user
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect Admin Email or Password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes= REFRESH_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub' : user['admin_email']}, expires_delta=access_token_expires)
    refresh_token = create_access_token(data={'sub' : user['admin_email']}, expires_delta=refresh_token_expires)
    # Set secure HTTP-only cookies for access and refresh tokens
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,                 # Prevents JavaScript from accessing the token
        secure=True,                   # Ensures it's only sent over HTTPS
        samesite="Lax",                # Helps prevent CSRF attacks
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Expiry in seconds
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,                 # Prevents JavaScript from accessing the token
        secure=True,                   # Ensures it's only sent over HTTPS
        samesite="Lax",                # Helps prevent CSRF attacks
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60  # Expiry in seconds
    )
    return {
        "message": "User logged in successfully!",
        "access_token": access_token,
        "token_type": "Bearer"
    }
