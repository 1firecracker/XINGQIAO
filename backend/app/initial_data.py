from app.database import SessionLocal
from app.models import Scenario, TrainingStep

def create_initial_data():
    """创建或更新初始演示数据"""
    db = SessionLocal()

    try:
        # 预设场景数据
        scenarios_data = [
            {
                "name": "超市排队",
                "description": "学习在超市结账时遵守排队规则",
                "icon": "🛒",
                "steps": [
                    {
                        "step_order": 1,
                        "instruction": "站在黄线后面",
                        "image_prompt": "a child standing quietly behind a clear thick yellow line on the floor, back view, clear spatial markers"
                    },
                    {
                        "step_order": 2,
                        "instruction": "保持安全距离",
                        "image_prompt": "two children waiting in line with a 2-meter gap between them, simple floor footprints markings"
                    },
                    {
                        "step_order": 3,
                        "instruction": "把物品放在柜台",
                        "image_prompt": "a single hand placing a milk carton on a clean white checkout counter, high contrast"
                    }
                ]
            },
            {
                "name": "过马路",
                "description": "交通安全与信号灯识别",
                "icon": "🚦",
                "steps": [
                    {
                        "step_order": 1,
                        "instruction": "转头观察",
                        "image_prompt": "白色背景，一个的小朋友站在斑马线前准备过马路前转头观察(没有通过马路)，头部明显向左转动90度观察，动作流畅自然。背景只有简单的灰色道路轮廓和黑白相间的斑马线。"
                    },
                    {
                        "step_order": 2,
                        "instruction": "耐心等待绿灯",
                        "image_prompt": "绘制小朋友站在斑马线前的背身(尚未通过马路)，抬头看着前方交通信号灯等待, 信号灯显示红色圆圈 "
                    },
                    {
                        "step_order": 3,
                        "instruction": "直行通过",
                        "image_prompt": "小朋友通过斑马线, 背景只有简单的道路轮廓和斑马线，小朋友占据画面中心位置"
                    }
                ]
            },
            {
                "name": "洗漱刷牙",
                "description": "每日晨间清洁习惯培养",
                "icon": "🪥",
                "steps": [
                    {
                        "step_order": 1,
                        "instruction": "挤牙膏",
                        "image_prompt": "a hand squeezing a pea-sized amount of blue toothpaste onto a toothbrush, close up"
                    },
                    {
                        "step_order": 2,
                        "instruction": "刷刷牙",
                        "image_prompt": "a child with a happy expression brushing teeth, simplified bathroom mirror background"
                    },
                    {
                        "step_order": 3,
                        "instruction": "漱口杯洗嘴巴",
                        "image_prompt": "a child holding a simple light blue plastic cup to their mouth"
                    }
                ]
            }
        ]

        for scenario_data in scenarios_data:
            steps_data = scenario_data.pop("steps")
            scenario_name = scenario_data["name"]
            
            # 检查场景是否已存在
            existing_scenario = db.query(Scenario).filter(Scenario.name == scenario_name, Scenario.is_custom == False).first()
            
            if existing_scenario:
                # 更新现有场景
                print(f"更新场景: {scenario_name}")
                existing_scenario.description = scenario_data.get("description", existing_scenario.description)
                existing_scenario.icon = scenario_data.get("icon", existing_scenario.icon)
                
                # 删除旧的步骤
                for old_step in existing_scenario.steps:
                    db.delete(old_step)
                
                # 添加新步骤
                for step_data in steps_data:
                    step = TrainingStep(**step_data)
                    existing_scenario.steps.append(step)
            else:
                # 创建新场景
                print(f"创建场景: {scenario_name}")
                scenario = Scenario(**scenario_data, is_custom=False)
                
                for step_data in steps_data:
                    step = TrainingStep(**step_data)
                    scenario.steps.append(step)
                
                db.add(scenario)

        db.commit()
        print("初始数据创建/更新完成")

    except Exception as e:
        print(f"创建/更新初始数据失败: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()

