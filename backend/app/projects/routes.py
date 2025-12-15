from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.projects.schemas import ProjectCreate, ProjectResponse
from app.projects.service import (
    create_project,
    get_projects,
    get_project,
    delete_project,
)
from app.auth.service import get_current_user
from app.db import get_database

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_new_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    try:
        return await create_project(project, current_user["id"], db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project",
        )

@router.get(
    "/",
    response_model=List[ProjectResponse]
)
async def read_projects(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    try:
        return await get_projects(current_user["id"], db)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch projects",
        )

@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
async def read_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    project = await get_project(project_id, current_user["id"], db)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project

@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def remove_project(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    deleted = await delete_project(project_id, current_user["id"], db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

@router.post(
    "/{project_id}/notes",
    response_model=dict,  # Using dict as we return the note object
    status_code=status.HTTP_201_CREATED
)
async def add_project_note(
    project_id: str,
    note: dict,  # Expecting {"content": "..."}
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    from app.projects.service import add_note
    try:
        if "content" not in note:
             raise HTTPException(status_code=400, detail="Content required")
             
        return await add_note(project_id, current_user["id"], note["content"], db)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add note",
        )

@router.delete(
    "/{project_id}/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_project_note(
    project_id: str,
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database),
):
    from app.projects.service import delete_note
    try:
        await delete_note(project_id, current_user["id"], note_id, db)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete note",
        )
