import os
from typing import List

class Settings:
    # AI服务配置
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    # 数据库配置
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

    # 应用配置
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    secret_key: str = os.getenv("SECRET_KEY", "hackathon-secret-key")

    # CORS配置
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")

settings = Settings()

