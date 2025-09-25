from dotenv import load_dotenv
from pymongo import MongoClient
from cryptography.fernet import Fernet
import os

load_dotenv()

Secret_key = os.getenv('Secret_key')
Fernet_Key = os.getenv('Fernet_Key')
algo = 'HS256'
# Token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 525600

# MongoDB Instance
Client = MongoClient(os.getenv('MONGODB'))
DB = Client['PRISMATIC']
# Collections
Users = DB['USERS']
Integrations = DB['Integrations']

# google oauth (integrations)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI") 
SCOPES = "https://www.googleapis.com/auth/gmail.readonly"

# Encription Setup
cipher = Fernet(Fernet_Key.encode())