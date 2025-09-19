import sys
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from config import Secret_key
from user_auth.routes import router_auth
from Integrations.routes import router_integrate
from starlette.middleware.sessions import SessionMiddleware

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = FastAPI(title="PRISMATIC API", version="1.0.0")
app.add_middleware(SessionMiddleware, secret_key = Secret_key)

# Include the user_auth router
app.include_router(router_auth, prefix="/auth", tags=["Authentication"])
app.include_router(router_integrate, prefix= "/integrate", tags=["Integrations"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to PRISMATIC API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)