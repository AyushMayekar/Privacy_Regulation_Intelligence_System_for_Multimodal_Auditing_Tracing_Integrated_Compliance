import os
from backend.config import Users
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Response
from dotenv import load_dotenv

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
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError as e:
        if "expired" in str(e):
            raise HTTPException(status_code=401, detail="Access token has expired.")
        raise credentials_exception

def hash_password(password : str):
    return pwd_context.hash(password.lower())

# verifying passwords
def verify_password(plain_password:str, hashed_password:str):
    return pwd_context.verify(plain_password.lower(), hashed_password)

# authenticate user
async def authenticate_user (username : str, password : str) :
    username = username.lower()
    user = Users.find_one({'username':username})
    # print(user)
    if user and verify_password(password, user.get('hashed_password', "")):
        return user
    return None

# register user
async def register_user (username : str, password : str, dob: str, profession: str, address: str, pincode: str, contact_number: str, email: str, latitude: str, longitude: str) :
    hashed_password = hash_password(password)
    hashed_contact = hash_password(contact_number)
    lat = float(latitude)
    lon = float(longitude)
    username = username.lower()
    password = password.lower()
    profession = profession.lower()
    address = address.lower()
    email = email.lower()
    user = Users.insert_one({'username':username,
                                'hashed_password':hashed_password,
                                'dob': dob,
                                'profession': profession,
                                'address': address,
                                'pincode': pincode,
                                'contact_number': hashed_contact,
                                'email': email,
                                'location': {
                                    "type": "Point",
                                    "coordinates": [lon, lat]  
                                            }
                                })
    return user

# login user
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes= REFRESH_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={'sub' : user['username']}, expires_delta=access_token_expires)
    refresh_token = create_access_token(data={'sub' : user['username']}, expires_delta=refresh_token_expires)
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
