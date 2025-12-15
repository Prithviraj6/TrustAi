from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.db import get_database
from app.auth.schemas import UserCreate, TokenData
from app.config import settings
from app.utils.crypto import create_access_token
from app.utils.crypto import get_password_hash, verify_password
from datetime import timedelta, datetime
from bson import ObjectId
from uuid import uuid4

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_user_by_email(email: str, db):
    user = await db.users.find_one({"email": email})
    return user

async def create_user(user: UserCreate, db):
    existing_user = await get_user_by_email(user.email, db)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["role"] = "user"
    user_dict["last_login"] = datetime.utcnow()
    
    new_user = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": new_user.inserted_id})
    
    return {
        "id": str(created_user["_id"]),
        "email": created_user["email"],
        "name": created_user["name"],
        "role": created_user.get("role", "user"),
        "last_login": created_user.get("last_login")
    }

async def authenticate_user(email: str, password: str, db):
    user = await get_user_by_email(email, db)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
        
    # Update last_login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = await get_user_by_email(token_data.email, db)
    if user is None:
        raise credentials_exception
        
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "user"),
        "last_login": user.get("last_login"),
        "bio": user.get("bio"),
        "profile_image": user.get("profile_image")
    }

async def update_user_profile(user_id: str, update_data: dict, db):
    # Filter out None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No valid fields provided"
        )

        
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "name": updated_user["name"],
        "bio": updated_user.get("bio"),
        "profile_image": updated_user.get("profile_image")
    }

async def generate_password_reset_token(email: str, db):
    user = await get_user_by_email(email, db)
    if not user:
        # Return None or raise exception? 
        # For security, maybe just return None and handle in route to avoid user enumeration?
        # But for now, let's return None and let route decide.
        return None
    
    access_token_expires = timedelta(minutes=15) # Short expiration for reset
    reset_token = create_access_token(
        data={"sub": email, "type": "reset", "jti": str(uuid4())}, expires_delta=access_token_expires
    )
    return reset_token

async def reset_password(token: str, new_password: str, db):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
        
    user = await get_user_by_email(email, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    hashed_password = get_password_hash(new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )
    return True
