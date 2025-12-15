from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.messages.schemas import MessageCreate, MessageResponse
from app.messages.service import create_message, get_messages
from app.auth.service import get_current_user
from app.db import get_database

router = APIRouter(
    prefix="/projects/{project_id}/messages",
    tags=["Messages"]
)

@router.post(
    "/",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_new_message(
    project_id: str,
    message: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        return await create_message(
            project_id=project_id,
            user_id=current_user["id"],
            message=message,
            db=db
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create message"
        )

@router.get(
    "/",
    response_model=List[MessageResponse]
)
async def read_messages(
    project_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        return await get_messages(
            project_id=project_id,
            user_id=current_user["id"],
            db=db
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )
