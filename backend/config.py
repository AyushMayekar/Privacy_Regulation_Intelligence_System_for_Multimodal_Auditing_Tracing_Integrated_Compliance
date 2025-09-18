from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

# MongoDB Instance
Client = MongoClient(os.getenv('MONGODB'))
DB = Client['PRISMATIC']
# Collections
Users = DB['USERS']