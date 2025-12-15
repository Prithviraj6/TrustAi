from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# -------------------------
# CREATE MESSAGE
# -------------------------
class MessageCreate(BaseModel):
    role: str  # "user" or "ai"
    content: str
    project_id: Optional[str] = None
    analysis_id: Optional[str] = None
    analysis_markdown: Optional[str] = None
    score: Optional[float] = None
    citations: List[str] = Field(default_factory=list)


# -------------------------
# RESPONSE MESSAGE
# -------------------------
class MessageResponse(BaseModel):
    id: str = Field(..., alias="_id")
    project_id: str
    analysis_id: Optional[str] = None
    user_id: str
    role: str
    content: str
    analysis_markdown: Optional[str] = None
    score: Optional[float] = None
    citations: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        populate_by_name = True
