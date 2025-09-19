from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

Secret_key = os.getenv('Secret_key')

# MongoDB Instance
Client = MongoClient(os.getenv('MONGODB'))
DB = Client['PRISMATIC']
# Collections
Users = DB['USERS']
Integrations = DB['Integrations']

# google oauth (integrations)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")  # e.g., https://yourapp.com/auth/gmail/callback
SCOPES = "https://www.googleapis.com/auth/gmail.readonly"