import pytest
from app.crud import create_scenario
from app.schemas import ScenarioCreate, TrainingStepCreate

def test_create_scenario(client, db_session):
    """测试创建场景"""
    scenario_data = ScenarioCreate(
        name="测试场景",
        description="用于测试的场景",
        steps=[
            TrainingStepCreate(
                step_order=1,
                instruction="测试步骤1",
                image_prompt="test prompt"
            )
        ]
    )

    response = client.post("/api/scenarios/", json=scenario_data.dict())
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "测试场景"
    assert len(data["steps"]) == 1

def test_get_scenarios(client):
    """测试获取场景列表"""
    response = client.get("/api/scenarios/")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

def test_get_scenario_not_found(client):
    """测试获取不存在的场景"""
    response = client.get("/api/scenarios/999")
    assert response.status_code == 404

