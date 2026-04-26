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
Audits = DB['Audits']
Integrations = DB['Integrations']

# google oauth (integrations)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI") 
SCOPES = "https://www.googleapis.com/auth/gmail.readonly"

# Encription Setup
cipher = Fernet(Fernet_Key.encode())

# Email Setup
SMTP_GMAIL_APP_PASSWORD = os.getenv("SMTP_GMAIL_APP_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

# Groq API Key
Groq_API_Key = os.getenv("Groq_API_Key")

def create_db_indexes():
    """
    Create all MongoDB indexes. Called once on app startup from main.py.
    Keeping this separate from module-level code prevents crashes when
    config.py is imported before the DB connection is fully verified.
    """
    Audits.create_index([("admin", 1), ("ts", -1)])
    Audits.create_index([("dsar_id", 1)])
