from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.ai_service import ai_service
from app.schemas import ScenarioPlanRequest, ImageGenerateRequest, TTSGenerateRequest, APIResponse
from app.database import get_db
from app import models
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class PresetImageRequest(BaseModel):
    scenario_name: str
    step_order: int
    interest: Optional[str] = None

@router.post("/plan-scenario", response_model=APIResponse)
async def plan_scenario(request: ScenarioPlanRequest):
    # #region agent log
    import json
    import time
    with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
        f.write(json.dumps({"location":"routes/ai.py:plan_scenario","message":"plan_scenario API called","data":{"topic":request.topic},"timestamp":time.time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"B"})+'\n')
    # #endregion
    try:
        result = await ai_service.plan_scenario_steps(
            request.topic,
            request.preferences
        )
        # #region agent log
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"routes/ai.py:plan_scenario","message":"plan_scenario completed","data":{"total_images":result['total_images'],"steps_count":len(result['steps'])},"timestamp":time.time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"B"})+'\n')
        # #endregion
        return APIResponse(
            success=True,
            data={
                "total_images": result['total_images'],
                "steps": [step.dict() for step in result['steps']]
            },
            message="场景规划成功"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"场景规划失败: {str(e)}")

@router.post("/get-preset-image", response_model=APIResponse)
async def get_preset_image(request: PresetImageRequest):
    """获取预设图片URL（用于特定场景的固定图片）"""
    # 只处理"过马路"场景
    if request.scenario_name != "过马路":
        raise HTTPException(status_code=400, detail="此接口仅支持'过马路'场景")
    
    # 根据个性化设置选择图片组
    # 如果interest是"猫咪"或包含"猫"，使用cat版本
    use_cat_version = request.interest and ("猫" in request.interest or "cat" in request.interest.lower())
    
    # 构建文件名
    suffix = "cat" if use_cat_version else ""
    filename = f"crossroad{request.step_order}{suffix}.png"
    
    # 返回图片URL（相对路径，前端会转换为完整URL）
    image_url = f"/demo/{filename}"
    
    return APIResponse(
        success=True,
        data={"image_url": image_url},
        message="预设图片URL获取成功"
    )

@router.post("/generate-image", response_model=APIResponse)
async def generate_image(request: ImageGenerateRequest, db: Session = Depends(get_db)):
    # #region agent log
    import json
    import time
    with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
        f.write(json.dumps({"location":"routes/ai.py:generate_image","message":"Image generation API called","data":{"prompt":request.prompt[:50],"step_id":request.step_id,"scenario_id":request.scenario_id},"timestamp":time.time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"D"})+'\n')
    # #endregion
    try:
        image_url = await ai_service.generate_image(request.prompt)
        # #region agent log
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"routes/ai.py:generate_image","message":"Image generation completed","data":{"step_id":request.step_id,"scenario_id":request.scenario_id,"has_url":bool(image_url)},"timestamp":time.time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"D"})+'\n')
        # #endregion
        # #region agent log
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"routes/ai.py:generate_image","message":"Image URL returned","data":{"image_url":image_url,"url_type":type(image_url).__name__,"url_starts_with_files":image_url.startswith("/files") if isinstance(image_url, str) else False},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"B"})+'\n')
        # #endregion
        
        # 如果提供了step_id和scenario_id，自动保存到数据库
        if request.step_id and request.scenario_id:
            step = db.query(models.TrainingStep).filter(
                models.TrainingStep.id == request.step_id,
                models.TrainingStep.scenario_id == request.scenario_id
            ).first()
            if step:
                step.image_url = image_url
                db.commit()
                # #region agent log
                with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"location":"routes/ai.py:generate_image","message":"Image URL saved to database","data":{"step_id":request.step_id,"scenario_id":request.scenario_id,"image_url":image_url},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"B"})+'\n')
                # #endregion
        
        return APIResponse(
            success=True,
            data={"image_url": image_url},
            message="图像生成成功"
        )
    except Exception as e:
        # #region agent log
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"routes/ai.py:generate_image","message":"Image generation failed","data":{"error":str(e)},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"run1","hypothesisId":"B"})+'\n')
        # #endregion
        raise HTTPException(status_code=500, detail=f"图像生成失败: {str(e)}")

@router.post("/generate-tts", response_model=APIResponse)
async def generate_tts(request: TTSGenerateRequest):
    try:
        audio_url = await ai_service.generate_tts(
            request.text,
            request.voice_name,
            request.language
        )
        if audio_url:
            return APIResponse(
                success=True,
                data={"audio_url": audio_url, "audio_data": None},
                message="语音生成成功"
            )
        else:
            return APIResponse(
                success=False,
                data=None,
                message="TTS服务暂不可用，请稍后重试"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"语音生成失败: {str(e)}")

