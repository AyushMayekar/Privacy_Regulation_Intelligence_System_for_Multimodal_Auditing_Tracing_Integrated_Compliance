import sys
from pathlib import Path
from fastapi import FastAPI
from backend.user_auth.routes import router

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = FastAPI(title="PRISMATIC API", version="1.0.0")

# Include the user_auth router
app.include_router(router, prefix="/auth", tags=["authentication"])

@app.get("/")
async def root():
    return {"message": "Welcome to PRISMATIC API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)