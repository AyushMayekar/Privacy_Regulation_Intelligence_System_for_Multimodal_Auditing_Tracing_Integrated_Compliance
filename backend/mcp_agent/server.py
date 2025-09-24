# backend/mcp_agent/server.py
from mcp.server.fastmcp import FastMCP

app = FastMCP("prismatic-mcp")

# Example tool that MCP exposes
@app.tool()
def ping(name: str) -> str:
    """Simple ping tool for testing MCP connection"""
    return f"Pong {name}!"

if __name__ == "__main__":
    app.run()
