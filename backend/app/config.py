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

    # CORS配置（Railway部署时允许所有来源）
    _allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
    allowed_origins: List[str] = ["*"] if _allowed_origins == "*" else (
        _allowed_origins.split(",") if _allowed_origins else ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

settings = Settings()

