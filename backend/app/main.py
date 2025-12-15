from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.db import db
from app.utils.rate_limit import limiter

# 🔹 Global logging & exception handling
from app.utils.logging import setup_logging
from app.utils.exceptions import (
    http_exception_handler,
    unhandled_exception_handler,
)

# 🔹 Routers
from app.auth import routes as auth_routes
from app.projects import routes as projects_routes
from app.messages import routes as messages_routes
from app.files import routes as files_routes
from app.ai import routes as ai_routes
from app.analyses import routes as analyses_routes


settings = get_settings()

# 🔹 Create FastAPI app
app = FastAPI(title=settings.APP_NAME)

# 🔹 Setup rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 🔹 Setup logging
setup_logging()

# 🔹 Register global exception handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


# 🔹 Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # XSS protection for older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions policy (disable unnecessary APIs)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)


# 🔹 CORS (dynamic from environment)
# In production, set CORS_ORIGINS="https://yourdomain.com,https://api.yourdomain.com"
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 🔹 Database lifecycle
@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close()


# 🔹 Routers
app.include_router(auth_routes.router)
app.include_router(projects_routes.router)
app.include_router(messages_routes.router)
app.include_router(files_routes.router)
app.include_router(ai_routes.router)
app.include_router(analyses_routes.router)

# 🔹 Health check
@app.get("/")
async def root():
    return {"message": "Welcome to TrustAI Backend"}

