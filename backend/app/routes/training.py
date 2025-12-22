from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import TrainingRecord
from app.schemas import TrainingRecord as TrainingRecordSchema, TrainingRecordCreate
from app.crud import create_training_record, get_training_records

router = APIRouter()

@router.post("/start")
async def start_training(scenario_id: int, db: Session = Depends(get_db)):
    """开始训练会话"""
    record = TrainingRecord(
        scenario_id=scenario_id,
        started_at=datetime.now()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"training_id": record.id, "started_at": record.started_at}

@router.post("/{training_id}/step")
async def complete_step(training_id: int, step_id: int, db: Session = Depends(get_db)):
    """完成训练步骤"""
    record = db.query(TrainingRecord).filter(TrainingRecord.id == training_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Training record not found")
    
    record.completed_steps += 1
    db.commit()
    return {"completed_steps": record.completed_steps}

@router.post("/{training_id}/finish")
async def finish_training(training_id: int, data: dict, db: Session = Depends(get_db)):
    """完成训练"""
    record = db.query(TrainingRecord).filter(TrainingRecord.id == training_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Training record not found")
    
    record.completed_at = datetime.now()
    record.score = data.get("score", 0)
    record.total_steps = data.get("total_steps", 0)
    record.completed_steps = data.get("completed_steps", 0)
    
    db.commit()
    db.refresh(record)
    return record

@router.get("/history", response_model=List[TrainingRecordSchema])
async def get_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取训练历史"""
    return get_training_records(db, skip=skip, limit=limit)

