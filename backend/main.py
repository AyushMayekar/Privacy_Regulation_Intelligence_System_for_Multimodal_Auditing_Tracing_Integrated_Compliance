import sys
import uvicorn
from pathlib import Path
from fastapi import FastAPI
from config import Secret_key
from user_auth.routes import router_auth
from integrations.routes import router_integrate
from chat.routes import router_chat
from auditing_and_reporting.routes import router_audits 
from langgraph_Orchestration.routes import router_findings
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

app = FastAPI(title="PRISMATIC API", version="1.0.0")
app.add_middleware(
    SessionMiddleware, 
    secret_key=Secret_key,
    same_site="none",  # Required for cross-origin cookies
    https_only=True    # Required when same_site="none"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # ── Production ────────────────────────────────────────────────────────
        "https://prismatic-lemon.vercel.app",

        # ── Local development ─────────────────────────────────────────────────
        # Comment the line above and uncomment below when running locally:
        "http://localhost:5173",
    ],
    allow_credentials=True,   # Required for httpOnly cookies to travel cross-origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the user_auth router
app.include_router(router_auth, prefix="/auth", tags=["Authentication"])
app.include_router(router_integrate, prefix="/integrate", tags=["Integrations"])
app.include_router(router_chat, prefix="/chat", tags=["Chat"])
app.include_router(router_audits, prefix="/audits", tags=["Audits"])
app.include_router(router_findings, prefix="/findings", tags=["Findings"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to PRISMATIC API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)