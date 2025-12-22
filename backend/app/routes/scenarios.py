from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import Scenario as ScenarioSchema, ScenarioCreate, StepImageUpdateRequest, APIResponse
from app.crud import create_scenario, get_scenarios, get_scenario
from app import models

router = APIRouter()

@router.get("/", response_model=List[ScenarioSchema])
async def read_scenarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scenarios = get_scenarios(db, skip=skip, limit=limit)
    return scenarios

@router.post("/", response_model=ScenarioSchema)
async def create_new_scenario(scenario: ScenarioCreate, db: Session = Depends(get_db)):
    return create_scenario(db=db, scenario=scenario)

@router.get("/{scenario_id}", response_model=ScenarioSchema)
async def read_scenario(scenario_id: int, db: Session = Depends(get_db)):
    db_scenario = get_scenario(db, scenario_id=scenario_id)
    if db_scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return db_scenario

@router.patch("/{scenario_id}/steps/{step_id}/image", response_model=APIResponse)
async def update_step_image(
    scenario_id: int,
    step_id: int,
    request: StepImageUpdateRequest,
    db: Session = Depends(get_db)
):
    """更新训练步骤的图片URL"""
    step = db.query(models.TrainingStep).filter(
        models.TrainingStep.id == step_id,
        models.TrainingStep.scenario_id == scenario_id
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step.image_url = request.image_url
    db.commit()
    db.refresh(step)
    return APIResponse(success=True, message="图片URL已更新", data={"image_url": step.image_url})

