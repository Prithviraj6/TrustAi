from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from app.messages.schemas import MessageCreate


# -------------------------
# CREATE MESSAGE
# -------------------------
async def create_message(project_id: str, user_id: str, message: MessageCreate, db):
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
            detail="Not authorized to access this project"
        )

    message_doc = {
        "project_id": ObjectId(project_id),
        "user_id": user_id,
        "role": message.role,
        "content": message.content,
        "created_at": datetime.utcnow()
    }

    result = await db.messages.insert_one(message_doc)
    message_doc["_id"] = str(result.inserted_id)
    message_doc["project_id"] = project_id

    return message_doc


# -------------------------
# GET MESSAGES
# -------------------------
async def get_messages(project_id: str, user_id: str, db):
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
            detail="Not authorized to access this project"
        )

    messages = []

    cursor = (
        db.messages
        .find({"project_id": ObjectId(project_id)})
        .sort("created_at", 1)
    )

    async for message in cursor:
        message["_id"] = str(message["_id"])
        message["project_id"] = project_id
        messages.append(message)

    return messages

async def create_ai_message(
    project_id: str,
    user_id: str,
    ai_result: dict,
    db
):
    message_doc = {
        "project_id": ObjectId(project_id),
        "user_id": user_id,
        "role": "ai",
        "content": ai_result["analysis_markdown"],
        "score": ai_result["score"],
        "citations": ai_result.get("citations", []),
        "created_at": datetime.utcnow()
    }

    result = await db.messages.insert_one(message_doc)

    # --- RECALCULATE PROJECT TRUST SCORE ---
    # Fetch all scored messages for this project
    pipeline = [
        {"$match": {"project_id": ObjectId(project_id), "score": {"$ne": None}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
    ]
    
    agg_result = await db.messages.aggregate(pipeline).to_list(length=1)
    
    if agg_result:
        avg_score = round(agg_result[0]["avg_score"], 1)
        
        # Determine Status
        status_val = "Neutral"
        if avg_score >= 80:
            status_val = "Trustworthy"
        elif avg_score < 50:
            status_val = "Risky"
            
        # Update Project
        await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$set": {
                    "trust_score": avg_score,
                    "status": status_val,
                    "lastUpdated": datetime.utcnow()
                }
            }
        )

    message_doc["_id"] = str(result.inserted_id)
    message_doc["project_id"] = project_id

    return message_doc
