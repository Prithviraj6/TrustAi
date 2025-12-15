from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FileResponse(BaseModel):
    id: str = Field(..., alias="_id")
    project_id: str
    user_id: str
    filename: str
    mimetype: str
    size: int
    stored_path: str
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
