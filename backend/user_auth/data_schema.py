from pydantic import BaseModel

class UserCreate(BaseModel):
    org_name: str
    username: str
    password: str
    work_email: str
    dob: str
    profession: str
    address: str
    pincode: str
    contact_number: str
    email: str
    latitude: str
    longitude: str


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str


class TokenData(BaseModel):
    full_name: str | None = None
