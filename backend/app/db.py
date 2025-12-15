from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

class Database:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db = None

    async def connect(self):
        if self.client is None:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
            try:
                await self.client.admin.command('ping')
                print(f"[INFO] Connected to MongoDB at {settings.MONGODB_URL}")
            except Exception as e:
                print(f"[ERROR] Failed to connect to MongoDB: {e}")
                self.client = None
                raise e
            self.db = self.client[settings.DB_NAME]

    async def close(self):
        if self.client:
            self.client.close()
            print("[INFO] Closed MongoDB connection")

    def get_db(self):
        if self.db is None:
            raise RuntimeError("Database not initialized")
        return self.db

db = Database()

async def get_database():
    return db.get_db()
