from fastapi import APIRouter, Depends, HTTPException, status, Request

from app.auth.schemas import UserCreate, Token, UserResponse, UserLogin, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
from app.auth.service import create_user, authenticate_user, get_current_user, update_user_profile, generate_password_reset_token, reset_password
from app.db import get_database
from app.utils.crypto import create_access_token
from app.utils.rate_limit import limiter
from datetime import timedelta, datetime, timezone
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
@limiter.limit("3/minute")  # 3 signup attempts per minute per IP
async def signup(request: Request, user: UserCreate, db = Depends(get_database)):
    return await create_user(user, db)

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")  # 5 login attempts per minute per IP
async def login(
    request: Request,
    user_credentials: UserLogin,
    db = Depends(get_database)
):
    email = user_credentials.email.lower()
    user = await authenticate_user(email, user_credentials.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
            "last_login": user.get("last_login")
        }
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate, 
    current_user = Depends(get_current_user),
    db = Depends(get_database)
):
    return await update_user_profile(current_user["id"], update_data.model_dump(), db)

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db = Depends(get_database)):
    from app.utils.email import send_password_reset_email
    import logging
    
    logger = logging.getLogger(__name__)
    token = await generate_password_reset_token(request.email, db)
    
    if token:
        # Send password reset email
        email_sent = await send_password_reset_email(request.email, token)
        if not email_sent:
            # Log without exposing email in production
            logger.warning("Password reset email could not be sent (SMTP not configured)")
        
    # Always return success message to prevent email enumeration
    return {"message": "If an account exists with this email, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password_endpoint(request: ResetPasswordRequest, db = Depends(get_database)):
    await reset_password(request.token, request.new_password, db)
    return {"message": "Password has been reset successfully"}

@router.post("/google", response_model=Token)
async def google_auth(request: dict, db = Depends(get_database)):
    """
    Authenticate user with Google ID token.
    Creates a new user if they don't exist.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests
    import secrets
    
    token = request.get("credential")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No credential provided"
        )
    
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email", "").lower()
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        users_collection = db["users"]
        existing_user = await users_collection.find_one({"email": email})
        
        if existing_user:
            # User exists - log them in
            user = existing_user
        else:
            # Create new user with random password (they'll use Google to login)
            from app.utils.crypto import hash_password
            random_password = secrets.token_urlsafe(32)
            
            new_user = {
                "email": email,
                "name": name,
                "hashed_password": hash_password(random_password),
                "role": "user",
                "picture": picture,
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
                "last_login": datetime.now(timezone.utc)
            }
            result = await users_collection.insert_one(new_user)
            user = await users_collection.find_one({"_id": result.inserted_id})
        
        # Update last login
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}}
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"],
                "role": user.get("role", "user"),
                "last_login": user.get("last_login"),
                "picture": user.get("picture", "")
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )

