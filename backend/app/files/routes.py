from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from app.files.service import save_upload_file, get_file
from app.auth.service import get_current_user
from app.db import get_database
import os

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

@router.post(
    "/projects/{project_id}/upload",
    status_code=status.HTTP_201_CREATED
)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        return await save_upload_file(project_id, current_user["id"], file, db)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )

@router.get("/{file_id}")
async def read_file(
    file_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    file_doc = await get_file(file_id, current_user["id"], db)
    if not os.path.exists(file_doc["filepath"]):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(file_doc["filepath"], filename=file_doc["filename"], media_type=file_doc["mimetype"])

@router.get("/project/{project_id}")
async def read_project_files(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    from app.files.service import get_project_files
    return await get_project_files(project_id, current_user["id"], db)

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    from app.files.service import delete_file
    await delete_file(file_id, current_user["id"], db)
    return None
