from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AnalysisBase(BaseModel):
    project_id: str
    input_type: str = "text"  # text, pdf, image, camera
    input_text: Optional[str] = None
    ai_model: str = "llama3-70b"
    trust_score: float
    verdict: str  # Trustworthy, Neutral, Risky
    analysis_markdown: str
    citations: List[str] = Field(default_factory=list)

class AnalysisCreate(AnalysisBase):
    pass

class AnalysisResponse(AnalysisBase):
    id: str = Field(..., alias="_id", serialization_alias="id")
    user_id: str
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
