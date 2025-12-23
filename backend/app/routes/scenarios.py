from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import Scenario as ScenarioSchema, ScenarioCreate, StepImageUpdateRequest, APIResponse, TrainingStepCreate
from app import schemas
from app.crud import create_scenario, get_scenarios, get_scenario, delete_scenario_steps, update_scenario_steps
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

@router.delete("/{scenario_id}/steps", response_model=APIResponse)
async def delete_scenario_steps_endpoint(
    scenario_id: int,
    db: Session = Depends(get_db)
):
    """删除场景的所有步骤"""
    scenario = get_scenario(db, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    deleted_count = delete_scenario_steps(db, scenario_id)
    return APIResponse(success=True, message=f"已删除 {deleted_count} 个步骤", data={"deleted_count": deleted_count})

@router.put("/{scenario_id}/steps", response_model=APIResponse)
async def update_scenario_steps_endpoint(
    scenario_id: int,
    steps: List[TrainingStepCreate],
    db: Session = Depends(get_db)
):
    """更新场景的步骤（先删除旧步骤，再添加新步骤）"""
    scenario = get_scenario(db, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    updated_steps = update_scenario_steps(db, scenario_id, steps)
    return APIResponse(
        success=True,
        message="步骤已更新",
        data={"steps": [{"id": s.id, "step_order": s.step_order, "instruction": s.instruction, "image_prompt": s.image_prompt, "image_url": s.image_url} for s in updated_steps]}
    )

