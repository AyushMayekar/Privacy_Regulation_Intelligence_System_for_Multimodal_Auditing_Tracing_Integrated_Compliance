from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    org_name: str               
    admin_name: str             
    admin_email: EmailStr       
    password: str              
    consent: bool = False    


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str


class TokenData(BaseModel):
    full_name: str | None = None
