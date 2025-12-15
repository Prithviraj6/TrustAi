from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# -------------------------
# SUB MODELS
# -------------------------

class Note(BaseModel):
    id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, serialization_alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, serialization_alias="updatedAt")
    tags: List[str] = Field(default_factory=list)

class ProjectDocument(BaseModel):
    id: str
    name: str
    type: str
    url: Optional[str] = None
    size: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow, serialization_alias="addedAt")
    trust_score: Optional[float] = Field(default=None, serialization_alias="trustScore")

class ActivityLog(BaseModel):
    id: str
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[str] = None

class AnalysisResult(BaseModel):
    id: str
    content: str
    ai_response: str = Field(..., serialization_alias="aiResponse")
    trust_score: float = Field(..., serialization_alias="trustScore")
    status: str
    timestamp: datetime
    type: str
    file_name: Optional[str] = Field(None, serialization_alias="fileName")


# -------------------------
# BASE SCHEMAS
# -------------------------

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "General"
    tags: List[str] = Field(default_factory=list)
    priority: str = "Medium"
    status: str = "Neutral"
    trust_score: float = Field(0.0, serialization_alias="trustScore")
    type: str = "Mixed"
    files: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    trust_score: Optional[float] = Field(None, serialization_alias="trustScore")
    type: Optional[str] = None
    files: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: str = Field(..., alias="_id", serialization_alias="id")
    user_id: str
    created: datetime
    last_updated: datetime = Field(..., alias="lastUpdated", serialization_alias="lastUpdated")
    last_analysis_score: Optional[float] = Field(None, serialization_alias="lastAnalysisScore")

    notes: List[Note] = Field(default_factory=list)
    activityLog: List[ActivityLog] = Field(default_factory=list)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
