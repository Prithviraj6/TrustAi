import os
import aiofiles
from fastapi import UploadFile, HTTPException, status
from bson import ObjectId
from datetime import datetime
from pathlib import Path
from uuid import uuid4

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------
# SAVE FILE
# -------------------------
async def save_upload_file(project_id: str, user_id: str, file: UploadFile, db):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Verify project ownership
    project = await db.projects.find_one({
        "_id": ObjectId(project_id),
        "user_id": user_id
    })

    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload to this project"
        )

    # Secure filename
    file_ext = Path(file.filename).suffix
    safe_filename = f"{uuid4().hex}{file_ext}"

    project_dir = os.path.join(UPLOAD_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)

    file_path = os.path.join(project_dir, safe_filename)

    size = 0
    async with aiofiles.open(file_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                await out_file.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File too large"
                )
            await out_file.write(chunk)

    file_doc = {
        "project_id": ObjectId(project_id),
        "user_id": user_id,
        "filename": file.filename,
        "stored_name": safe_filename,
        "mimetype": file.content_type,
        "stored_path": file_path,
        "size": size,
        "extracted_text": None,
        "created_at": datetime.utcnow()
    }

    result = await db.files.insert_one(file_doc)
    file_id = str(result.inserted_id)

    # 🔹 Update Project file count only (no embedding)
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$inc": {"files": 1}}
    )

    file_doc["_id"] = file_id
    file_doc["project_id"] = project_id

    return file_doc


# -------------------------
# GET FILE
# -------------------------
async def get_file(file_id: str, user_id: str, db):
    if not ObjectId.is_valid(file_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_doc = await db.files.find_one({
        "_id": ObjectId(file_id),
        "user_id": user_id
    })

    if not file_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_doc["_id"] = str(file_doc["_id"])
    file_doc["project_id"] = str(file_doc["project_id"])

    return file_doc

async def get_project_files(project_id: str, user_id: str, db):
    cursor = db.files.find({"project_id": ObjectId(project_id), "user_id": user_id}).sort("created_at", -1)
    files = await cursor.to_list(length=100)
    
    return [
        {
            "id": str(f["_id"]),
            "project_id": str(f["project_id"]),
            "user_id": f["user_id"],
            "filename": f["filename"],
            "mimetype": f["mimetype"],
            "size": f["size"],
            "created_at": f["created_at"],
            "stored_path": f.get("stored_path"),
            "extracted_text": f.get("extracted_text")
        }
        for f in files

# ------------------------- of delete_file
    ]

# -------------------------
# DELETE FILE
# -------------------------
async def delete_file(file_id: str, user_id: str, db):
    if not ObjectId.is_valid(file_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Find the file first
    file_doc = await db.files.find_one({
        "_id": ObjectId(file_id),
        "user_id": user_id
    })

    if not file_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # 1. Delete from Filesystem
    try:
        # Use stored_path if available (backwards compatibility)
        file_path = file_doc.get("stored_path")
        
        # If not, try to reconstruct (legacy)
        if not file_path:
            project_id = str(file_doc["project_id"])
            stored_name = file_doc.get("stored_name")
            if stored_name:
                file_path = os.path.join(UPLOAD_DIR, project_id, stored_name)

        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file from disk: {e}")
        # Continue to delete record even if disk delete fails

    # 2. Delete from DB
    await db.files.delete_one({"_id": ObjectId(file_id)})

    # 3. Decrement Project File Count
    await db.projects.update_one(
        {"_id": file_doc["project_id"]},
        {"$inc": {"files": -1}}
    )

    return True
