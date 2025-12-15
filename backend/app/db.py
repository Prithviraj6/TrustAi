from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db = None

    async def connect(self):
        if self.client is None:
            # Optimized connection with pooling
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=50,  # Connection pool
                minPoolSize=10,  # Keep minimum connections ready
                maxIdleTimeMS=30000,  # Close idle connections after 30s
                retryWrites=True,
                retryReads=True,
            )
            try:
                await self.client.admin.command('ping')
                logger.info("Connected to MongoDB successfully")
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                self.client = None
                raise e
            self.db = self.client[settings.DB_NAME]
            
            # Create indexes for faster queries
            await self._create_indexes()

    async def _create_indexes(self):
        """Create database indexes for frequently queried fields"""
        try:
            # Users collection - email is frequently queried
            await self.db.users.create_index("email", unique=True)
            
            # Projects collection - user_id is frequently queried
            await self.db.projects.create_index("user_id")
            await self.db.projects.create_index([("user_id", 1), ("created", -1)])
            
            # Analyses collection - project_id and user_id
            await self.db.analyses.create_index("project_id")
            await self.db.analyses.create_index("user_id")
            await self.db.analyses.create_index([("user_id", 1), ("created_at", -1)])
            
            # Messages collection - project_id
            await self.db.messages.create_index("project_id")
            await self.db.messages.create_index([("project_id", 1), ("created_at", -1)])
            
            # Files collection - project_id
            await self.db.files.create_index("project_id")
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Some indexes may already exist: {e}")

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

    def get_db(self):
        if self.db is None:
            raise RuntimeError("Database not initialized")
        return self.db

db = Database()

async def get_database():
    return db.get_db()

