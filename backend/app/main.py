import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.routes import scenarios, training, ai
from app.utils.file_manager import file_manager

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 初始化数据
from app.initial_data import create_initial_data
create_initial_data()

app = FastAPI(
    title="星桥AI训练系统",
    description="黑客松轻量级版本",
    version="1.0.0"
)

# CORS配置（生产环境允许所有来源）
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if _allowed_origins_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 路由注册
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

# 挂载静态文件目录
app.mount("/files", StaticFiles(directory=str(file_manager.upload_dir)), name="files")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

