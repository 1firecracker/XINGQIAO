from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas

# Scenario CRUD
def get_scenario(db: Session, scenario_id: int):
    return db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()

def get_scenarios(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Scenario).offset(skip).limit(limit).all()

def create_scenario(db: Session, scenario: schemas.ScenarioCreate):
    db_scenario = models.Scenario(
        name=scenario.name,
        description=scenario.description,
        icon=scenario.icon,
        is_custom=True
    )
    db.add(db_scenario)
    db.flush()

    for step_data in scenario.steps:
        db_step = models.TrainingStep(
            scenario_id=db_scenario.id,
            step_order=step_data.step_order,
            instruction=step_data.instruction,
            image_prompt=step_data.image_prompt,
            image_url=step_data.image_url
        )
        db.add(db_step)

    db.commit()
    db.refresh(db_scenario)
    return db_scenario

# Training Record CRUD
def create_training_record(db: Session, record: schemas.TrainingRecordCreate):
    db_record = models.TrainingRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_training_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TrainingRecord).offset(skip).limit(limit).all()

def delete_scenario_steps(db: Session, scenario_id: int):
    """删除场景的所有步骤"""
    steps = db.query(models.TrainingStep).filter(
        models.TrainingStep.scenario_id == scenario_id
    ).all()
    for step in steps:
        db.delete(step)
    db.commit()
    return len(steps)

def update_scenario_steps(db: Session, scenario_id: int, steps: List[schemas.TrainingStepCreate]):
    """更新场景的步骤（先删除旧步骤，再添加新步骤）"""
    # 删除旧步骤
    delete_scenario_steps(db, scenario_id)
    
    # 添加新步骤
    for step_data in steps:
        db_step = models.TrainingStep(
            scenario_id=scenario_id,
            step_order=step_data.step_order,
            instruction=step_data.instruction,
            image_prompt=step_data.image_prompt,
            image_url=step_data.image_url
        )
        db.add(db_step)
    
    db.commit()
    db.refresh(db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first())
    return db.query(models.TrainingStep).filter(models.TrainingStep.scenario_id == scenario_id).order_by(models.TrainingStep.step_order).all()

