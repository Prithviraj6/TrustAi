from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth.service import get_current_user
from app.db import get_database
from app.analyses.schemas import AnalysisCreate, AnalysisResponse
from app.analyses.service import create_analysis, get_analysis, get_project_analyses

router = APIRouter(
    prefix="/analyses",
    tags=["Analyses"]
)

@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_new_analysis(
    analysis: AnalysisCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    return await create_analysis(analysis, current_user["id"], db)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def read_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    analysis = await get_analysis(analysis_id, current_user["id"], db)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.get("/project/{project_id}", response_model=List[AnalysisResponse])
async def read_project_analyses(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    return await get_project_analyses(project_id, current_user["id"], db)
