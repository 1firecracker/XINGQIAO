from app.database import SessionLocal
from app.models import Scenario, TrainingStep

def create_initial_data():
    """创建初始演示数据"""
    db = SessionLocal()

    try:
        # 检查是否已有数据
        if db.query(Scenario).count() > 0:
            print("初始数据已存在，跳过创建")
            return

        # 创建预设场景
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
                        "instruction": "红灯停",
                        "image_prompt": "a large bright red traffic light symbol, high contrast, stop gesture"
                    },
                    {
                        "step_order": 2,
                        "instruction": "绿灯行",
                        "image_prompt": "a large bright green traffic light symbol, walking person figure"
                    },
                    {
                        "step_order": 3,
                        "instruction": "走斑马线",
                        "image_prompt": "a child walking straight across thick white zebra crossing lines, blue sky"
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
            scenario = Scenario(**scenario_data, is_custom=False)

            for step_data in steps_data:
                step = TrainingStep(**step_data)
                scenario.steps.append(step)

            db.add(scenario)

        db.commit()
        print("初始数据创建完成")

    except Exception as e:
        print(f"创建初始数据失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()

