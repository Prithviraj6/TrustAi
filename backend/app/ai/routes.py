from app.ai.service import analyze_text_with_groq
from app.auth.service import get_current_user
from app.db import get_database
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timedelta
import asyncio

router = APIRouter(prefix="/ai", tags=["AI"])

# In-memory rate limiting store (resets on server restart)
# In production, use Redis for persistence across instances
guest_usage: Dict[str, List[datetime]] = {}
GUEST_DAILY_LIMIT = 3
GUEST_TEXT_LIMIT = 5000  # Max characters for guest

# Lock for thread-safe access
usage_lock = asyncio.Lock()

class AnalysisRequest(BaseModel):
    project_id: str | None = None
    text: str

class GuestAnalysisRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    score: float
    verdict: str
    citations: List[str]
    analysis_markdown: str

class GuestAnalysisResponse(BaseModel):
    score: float
    verdict: str
    citations: List[str]
    analysis_markdown: str
    remaining_credits: int

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(
    request: AnalysisRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # 1. Analyze
    ai_result = analyze_text_with_groq(request.text)

    # 2. Save as Message (Persistent Storage) - ONLY if project_id is provided
    if request.project_id:
        from app.messages.service import create_ai_message
        try:
            await create_ai_message(
                project_id=request.project_id,
                user_id=current_user["id"],
                ai_result=ai_result,
                db=db
            )
        except Exception as e:
            # We log error but still return result to user so they see the analysis
            print(f"Failed to save AI message: {e}")


    return ai_result


@router.post("/analyze-guest", response_model=GuestAnalysisResponse)
async def analyze_text_guest(request: GuestAnalysisRequest, req: Request):
    """
    Public endpoint for guest users.
    - Text only, no file uploads
    - No storage (temporary)
    - Rate limited: 3 analyses per day per IP
    - Max 5000 characters
    """
    client_ip = req.client.host if req.client else "unknown"
    
    # Validate text
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    if len(request.text) > GUEST_TEXT_LIMIT:
        raise HTTPException(
            status_code=400, 
            detail=f"Text exceeds {GUEST_TEXT_LIMIT} character limit. Sign up for unlimited analysis!"
        )
    
    # Check rate limit
    async with usage_lock:
        now = datetime.now()
        day_ago = now - timedelta(days=1)
        
        # Clean old entries
        if client_ip in guest_usage:
            guest_usage[client_ip] = [
                ts for ts in guest_usage[client_ip] if ts > day_ago
            ]
        else:
            guest_usage[client_ip] = []
        
        current_usage = len(guest_usage[client_ip])
        
        if current_usage >= GUEST_DAILY_LIMIT:
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Daily limit reached. Sign up for unlimited analyses!",
                    "remaining_credits": 0,
                    "reset_time": (guest_usage[client_ip][0] + timedelta(days=1)).isoformat()
                }
            )
        
        # Record this usage
        guest_usage[client_ip].append(now)
        remaining = GUEST_DAILY_LIMIT - current_usage - 1
    
    # Analyze
    ai_result = analyze_text_with_groq(request.text)
    
    return GuestAnalysisResponse(
        score=ai_result["score"],
        verdict=ai_result["verdict"],
        citations=ai_result["citations"],
        analysis_markdown=ai_result["analysis_markdown"],
        remaining_credits=remaining
    )


@router.get("/guest-credits")
async def get_guest_credits(req: Request):
    """Check remaining credits for a guest user"""
    client_ip = req.client.host if req.client else "unknown"
    
    now = datetime.now()
    day_ago = now - timedelta(days=1)
    
    if client_ip in guest_usage:
        valid_usage = [ts for ts in guest_usage[client_ip] if ts > day_ago]
        remaining = max(0, GUEST_DAILY_LIMIT - len(valid_usage))
    else:
        remaining = GUEST_DAILY_LIMIT
    
    return {
        "remaining_credits": remaining,
        "daily_limit": GUEST_DAILY_LIMIT
    }

