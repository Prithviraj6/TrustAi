from app.analyses.schemas import AnalysisCreate
from datetime import datetime
from bson import ObjectId

async def create_analysis(analysis: AnalysisCreate, user_id: str, db):
    analysis_dict = analysis.model_dump()
    analysis_dict["user_id"] = user_id
    analysis_dict["created_at"] = datetime.utcnow()
    
    new_analysis = await db.analyses.insert_one(analysis_dict)
    created_analysis = await db.analyses.find_one({"_id": new_analysis.inserted_id})
    
    # Convert _id to string to satisfy Pydantic
    created_analysis["id"] = str(created_analysis.pop("_id"))
    
    return created_analysis

async def get_analysis(analysis_id: str, user_id: str, db):
    analysis = await db.analyses.find_one({"_id": ObjectId(analysis_id), "user_id": user_id})
    if analysis:
        analysis["id"] = str(analysis.pop("_id"))
        return analysis
    return None

async def get_project_analyses(project_id: str, user_id: str, db):
    cursor = db.analyses.find({"project_id": project_id, "user_id": user_id}).sort("created_at", -1)
    analyses = await cursor.to_list(length=100)
    
    results = []
    for a in analyses:
        a["id"] = str(a.pop("_id"))
        results.append(a)
        
    return results
