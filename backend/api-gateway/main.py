"""
API Gateway - Main Entry Point (Port 3000)
Routes requests to 3 microservices:
- Adaptive Learning: port 5004
- Risk Predictor: port 5002
- Stress Prediction: port 5003
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="API Gateway",
    description="Central entry point for all microservices",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
ADAPTIVE_LEARNING_URL = os.getenv("ADAPTIVE_LEARNING_URL", "http://localhost:5004")
RISK_PREDICTOR_URL = os.getenv("RISK_PREDICTOR_URL", "http://localhost:5002")
STRESS_PREDICTION_URL = os.getenv("STRESS_PREDICTION_URL", "http://localhost:5003")

SERVICE_ROUTES = {
    "adaptive": ADAPTIVE_LEARNING_URL,
    "risk": RISK_PREDICTOR_URL,
    "stress": STRESS_PREDICTION_URL,
}

@app.get("/")
async def root():
    return {
        "message": "API Gateway - Welcome",
        "services": {
            "adaptive-learning": "/api/adaptive",
            "risk-predictor": "/api/risk",
            "stress-prediction": "/api/stress",
        },
        "health": "/health",
    }

@app.get("/health")
async def health():
    """Check health status of all services"""
    health_status = {}
    
    async with httpx.AsyncClient(timeout=5) as client:
        for service_name, url in SERVICE_ROUTES.items():
            try:
                response = await client.get(f"{url}/")
                health_status[service_name] = {
                    "status": "UP",
                    "url": url
                }
            except Exception as e:
                health_status[service_name] = {
                    "status": "DOWN",
                    "url": url,
                    "error": str(e)
                }
    
    return health_status

# ─── Adaptive Learning Service ───
@app.api_route("/api/adaptive/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def adaptive_learning_proxy(request: Request, path: str):
    return await proxy_request(request, ADAPTIVE_LEARNING_URL, path)

# ─── Risk Predictor Service ───
@app.api_route("/api/risk/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def risk_predictor_proxy(request: Request, path: str):
    return await proxy_request(request, RISK_PREDICTOR_URL, path)

# ─── Stress Prediction Service ───
@app.api_route("/api/stress/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def stress_prediction_proxy(request: Request, path: str):
    return await proxy_request(request, STRESS_PREDICTION_URL, path)

async def proxy_request(request: Request, service_url: str, path: str):
    """Forward request to microservice and return response"""
    try:
        # Build target URL
        target_url = f"{service_url}/{path}"
        if request.url.query:
            target_url += f"?{request.url.query}"
        
        # Read request body if present
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
        
        # Forward request
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                content=body,
                headers={key: value for key, value in request.headers.items() 
                        if key.lower() not in ["host", "content-length"]},
            )
        
        # Return response
        return JSONResponse(
            content=response.json() if response.headers.get("content-type") == "application/json" else response.text,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail=f"Service unavailable at {service_url}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
