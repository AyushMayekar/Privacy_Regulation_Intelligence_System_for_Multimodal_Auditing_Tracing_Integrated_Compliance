from pymongo import MongoClient
from bson import ObjectId
from mcp_agent.transformations import TransformationType, DSARType
from config import Integrations, cipher

def is_enforcement_allowed(dsar_type: DSARType) -> bool: 
    return dsar_type in { DSARType.DELETE, DSARType.RECTIFY, DSARType.RESTRICT_PROCESSING }

class MongoEnforcer:

    @staticmethod
    def apply(
        admin_email: str,
        decision,
        transformed_value
    ):
    # Fetching MongoDB connection URI from admin_email
        integration = Integrations.find_one({"admin_email": admin_email})
        
        if not integration or not integration.get("MongoConnection", False):
            return {
                "success": False,
                "message": "No MongoDB connection found. Please connect via Integrations tab."
            }
        
        encrypted_uri = integration.get("encrypted_mongo_uri")
        if not encrypted_uri:
            return {"success": False, "message": "Mongo URI not found in database. Please connect via Integrations tab."}
        try:
            mongo_uri = cipher.decrypt(encrypted_uri.encode()).decode()
        except Exception as e:
            return {"success": False, "message": f"Failed to decrypt Mongo URI: {str(e)}"}

        finding = decision.finding
        transformation = decision.transformation_type

        db_name, collection_name = finding["collection"].split(".", 1)
        document_id = finding["document_id"]
        field_path = finding["field_path"]

        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]

        # --- DELETE ---
        if transformation == TransformationType.DATA_DELETION_HARD:
            collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$unset": {field_path: ""}}
            )

        # --- RECTIFY / ANONYMIZE / ENCRYPT ---
        elif transformation in {
            TransformationType.ANONYMIZATION,
            TransformationType.DATA_RECTIFICATION,
            TransformationType.ENCRYPTION_RANDOMIZED
        }:
            collection.update_one(
                {"_id": ObjectId(document_id)},
                {"$set": {field_path: transformed_value}}
            )

        client.close()
