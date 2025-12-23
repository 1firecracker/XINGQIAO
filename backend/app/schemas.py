from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime

# 训练步骤
class TrainingStepBase(BaseModel):
    step_order: int
    instruction: str
    image_prompt: Optional[str] = None
    image_url: Optional[str] = None

class TrainingStepCreate(TrainingStepBase):
    pass

class TrainingStep(TrainingStepBase):
    id: int
    scenario_id: int
    assistance_level: Optional[Literal['F', 'P', 'I']] = None

    class Config:
        from_attributes = True

# 场景
class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: str = "🎯"

class ScenarioCreate(ScenarioBase):
    steps: List[TrainingStepCreate] = []

class Scenario(ScenarioBase):
    id: int
    is_custom: bool
    creator_id: Optional[int]
    steps: List[TrainingStep] = []
    created_at: datetime

    class Config:
        from_attributes = True

# 训练记录
class TrainingRecordBase(BaseModel):
    scenario_id: int
    score: int = 0  # 保留用于向后兼容
    total_steps: int = 0
    completed_steps: int = 0
    step_levels: Optional[List[Literal['F', 'P', 'I']]] = None
    overall_level: Optional[Literal['F', 'P', 'I']] = None
    milestone: Optional[Literal['Level1', 'Level2']] = None

class TrainingRecordCreate(TrainingRecordBase):
    pass

class TrainingRecord(TrainingRecordBase):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# AI请求/响应
class ScenarioPlanRequest(BaseModel):
    topic: str
    preferences: Optional[dict] = {}

class ImageGenerateRequest(BaseModel):
    prompt: str
    step_id: Optional[int] = None
    scenario_id: Optional[int] = None

class StepImageUpdateRequest(BaseModel):
    image_url: str

class TTSGenerateRequest(BaseModel):
    text: str
    voice_name: Optional[str] = "Kore"  # 默认语音
    language: Optional[str] = "zh-CN"   # 默认语言

class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None
    error: Optional[dict] = None

