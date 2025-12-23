from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String, default="🎯")
    is_custom = Column(Boolean, default=False)
    creator_id = Column(Integer, nullable=True)

    # 关联
    steps = relationship("TrainingStep", back_populates="scenario", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=func.now())

class TrainingStep(Base):
    __tablename__ = "training_steps"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    instruction = Column(Text, nullable=False)
    image_prompt = Column(Text)
    image_url = Column(String)
    assistance_level = Column(String, nullable=True)  # 'F', 'P', or 'I'

    # 关联
    scenario = relationship("Scenario", back_populates="steps")

class TrainingRecord(Base):
    __tablename__ = "training_records"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    user_id = Column(Integer, nullable=True)

    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    score = Column(Integer, default=0)  # 保留用于向后兼容
    total_steps = Column(Integer, default=0)
    completed_steps = Column(Integer, default=0)
    step_levels = Column(JSON, nullable=True)  # 存储每个步骤的辅助等级数组 ['F', 'P', 'I', ...]
    overall_level = Column(String, nullable=True)  # 'F', 'P', or 'I'
    milestone = Column(String, nullable=True)  # 'Level1' or 'Level2'

    # 关联
    scenario = relationship("Scenario")

class GeneratedContent(Base):
    __tablename__ = "generated_content"

    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, nullable=False)
    prompt = Column(Text, nullable=False)
    content_url = Column(String)
    content_data = Column(Text)

    created_at = Column(DateTime, default=func.now())

