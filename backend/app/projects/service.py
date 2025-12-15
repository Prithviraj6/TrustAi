from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from app.projects.schemas import ProjectCreate

# -------------------------
# CREATE PROJECT
# -------------------------
async def create_project(project: ProjectCreate, user_id: str, db):
    project_doc = {
        "name": project.name,
        "description": project.description,
        "user_id": user_id,
        "created": datetime.utcnow(),
        "lastUpdated": datetime.utcnow(),
        "status": "Neutral",
        "priority": "Medium",
        "category": project.category,
        "type": "Mixed",
        "trust_score": 0.0,
        "files": 0,
        "history": [],
        "documents": [],
        "notes": [],
        "activityLog": [],
        "tags": [],
    }

    result = await db.projects.insert_one(project_doc)
    project_doc["_id"] = str(result.inserted_id)

    return project_doc


# -------------------------
# GET ALL PROJECTS
# -------------------------
async def get_projects(user_id: str, db):
    projects = []

    cursor = (
        db.projects
        .find({"user_id": user_id})
        .sort("created", -1)
    )

    async for project in cursor:
        project["_id"] = str(project["_id"])
        projects.append(project)

    return projects


# -------------------------
# GET SINGLE PROJECT
# -------------------------
async def get_project(project_id: str, user_id: str, db):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": user_id
    })

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    project["_id"] = str(project["_id"])
    return project


# -------------------------
# DELETE PROJECT
# -------------------------
async def delete_project(project_id: str, user_id: str, db):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    result = await db.projects.delete_one({
        "_id": ObjectId(project_id),
        "user_id": user_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return True


# -------------------------
# ADD NOTE
# -------------------------
from uuid import uuid4

async def add_note(project_id: str, user_id: str, content: str, db):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    note_id = str(uuid4())
    note = {
        "id": note_id,
        "content": content,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "tags": []
    }

    result = await db.projects.update_one(
        {"_id": ObjectId(project_id), "user_id": user_id},
        {"$push": {"notes": note}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return note


# -------------------------
# DELETE NOTE
# -------------------------
async def delete_note(project_id: str, user_id: str, note_id: str, db):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    result = await db.projects.update_one(
        {"_id": ObjectId(project_id), "user_id": user_id},
        {"$pull": {"notes": {"id": note_id}}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    if result.modified_count == 0:
        # Note not found in the array
        pass 

    return True
