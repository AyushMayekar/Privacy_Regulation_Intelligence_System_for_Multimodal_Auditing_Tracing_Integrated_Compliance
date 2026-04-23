from pydantic import BaseModel

class MongoIntegration(BaseModel):
    mongo_uri: str