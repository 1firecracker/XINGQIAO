import pytest

def test_start_training(client):
    """测试开始训练"""
    # 首先创建一个场景
    scenario_data = {
        "name": "测试场景",
        "description": "测试",
        "steps": [
            {
                "step_order": 1,
                "instruction": "步骤1",
                "image_prompt": "test"
            }
        ]
    }
    scenario_response = client.post("/api/scenarios/", json=scenario_data)
    scenario_id = scenario_response.json()["id"]

    # 开始训练
    response = client.post("/api/training/start", params={"scenario_id": scenario_id})
    assert response.status_code == 200
    assert "training_id" in response.json()

def test_get_training_history(client):
    """测试获取训练历史"""
    response = client.get("/api/training/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

