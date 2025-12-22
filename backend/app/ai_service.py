from google import genai
import json
import urllib.parse
import base64
from datetime import datetime
from app.config import settings
from app.schemas import TrainingStepCreate
from app.utils.file_manager import file_manager
from typing import List, Dict, Any

class AIService:
    def __init__(self):
        # 使用新版SDK的Client
        # 如果API密钥为空，延迟初始化（用于测试环境）
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def plan_scenario_steps(self, topic: str, preferences: dict = None) -> Dict[str, Any]:
        """AI规划场景步骤"""
        prompt = f"""
你是一位资深的特殊教育专家，为孤独症儿童设计社交故事。

主题：{topic}
儿童偏好：{preferences or {}}

请设计3-5个循序渐进的训练步骤，每个步骤包含：
1. 清晰简洁的指令（中文）
2. 对应的视觉提示词（英文，用于生成图像）

请以JSON格式返回，格式如下：
{{
  "total_images": 3,
  "steps": [
    {{
      "step_order": 1,
      "instruction": "步骤说明",
      "image_prompt": "英文图像描述"
    }}
  ]
}}

注意：
- total_images必须等于steps数组的长度
- 确保steps数组中的step_order字段与数组索引匹配（从1开始）
"""

        try:
            if not self.client:
                raise Exception("API client not initialized")
            # 使用新版SDK的API调用方式
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            response_text = response.text.strip()
            
            # 尝试提取JSON
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
            
            data = json.loads(response_text)
            steps_data = data.get('steps', [])
            total_images = data.get('total_images', len(steps_data))

            # 验证total_images与steps长度一致
            if total_images != len(steps_data):
                print(f"Warning: total_images ({total_images}) != steps length ({len(steps_data)}), using steps length")
                total_images = len(steps_data)

            print(f"🎨 AI规划完成：将生成 {total_images} 张训练图片")
            return {
                'total_images': total_images,
                'steps': [TrainingStepCreate(**step) for step in steps_data]
            }
        except Exception as e:
            print(f"AI planning failed: {e}")
            # 返回默认步骤
            default_steps = [
                TrainingStepCreate(
                    step_order=1,
                    instruction=f"准备开始{topic}训练",
                    image_prompt=f"A child preparing for {topic} activity, simple illustration"
                ),
                TrainingStepCreate(
                    step_order=2,
                    instruction=f"执行{topic}的主要步骤",
                    image_prompt=f"A child performing {topic} activity, clear visual guide"
                ),
                TrainingStepCreate(
                    step_order=3,
                    instruction=f"完成{topic}训练",
                    image_prompt=f"A child completing {topic} activity successfully"
                )
            ]
            print(f"🎨 使用默认规划：将生成 {len(default_steps)} 张训练图片")
            return {
                'total_images': len(default_steps),
                'steps': default_steps
            }

    async def generate_image(self, prompt: str) -> str:
        """生成训练图像"""
        try:
            # 构建完整的图像生成提示词
            full_prompt = f"{prompt}, flat vector illustration, minimalist, thick clean black outlines, high contrast, pure white background, low saturation colors, pastel blue and green palette, educational visual support style"
            
            # 使用新版SDK调用图像生成模型
            try:
                if not self.client:
                    raise Exception("API client not initialized")
                # 使用gemini-2.5-flash-image模型生成图像
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash-image",
                    contents=full_prompt
                )
                
                # 提取图像数据
                if response and response.candidates:
                    for candidate in response.candidates:
                        if candidate.content and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    # 获取图像数据（可能是bytes或base64字符串）
                                    image_data = part.inline_data.data
                                    
                                    # 保存图像文件
                                    relative_path = file_manager.save_image(image_data)
                                    
                                    # 返回文件URL
                                    return file_manager.get_file_url(relative_path)
            except Exception as img_error:
                print(f"Image model generation failed: {img_error}")
                # 如果图像生成失败，使用fallback
            
            # Fallback: 如果图像生成模型不可用，使用placeholder
            return self._get_fallback_image(prompt)
        except Exception as e:
            print(f"Image generation failed: {e}")
            return self._get_fallback_image(prompt)

    def _get_fallback_image(self, prompt: str) -> str:
        """备用图像生成"""
        encoded_prompt = urllib.parse.quote(prompt[:50])
        return f"https://placehold.co/400x400/3b82f6/ffffff?text={encoded_prompt}"

    async def generate_tts(self, text: str, voice_name: str = "Kore", language: str = "zh-CN") -> str:
        """生成TTS语音"""
        try:
            # 尝试使用Gemini的TTS功能
            # 注意：Gemini API的TTS支持可能有限，这里尝试使用支持音频生成的模型
            try:
                # 构建TTS请求
                prompt = f"Please say this text in a gentle, slow {language} tone: {text}"
                
                if not self.client:
                    raise Exception("API client not initialized")
                # 使用新版SDK调用（暂时保持原有逻辑，后续可优化）
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                
                # 提取音频数据
                if response and response.candidates:
                    for candidate in response.candidates:
                        if candidate.content and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    audio_base64 = part.inline_data.data
                                    mime_type = getattr(part.inline_data, 'mime_type', 'audio/mp3')
                                    
                                    # 确定文件扩展名
                                    ext = '.mp3'
                                    if 'wav' in mime_type:
                                        ext = '.wav'
                                    elif 'ogg' in mime_type:
                                        ext = '.ogg'
                                    
                                    # 保存音频文件
                                    relative_path = file_manager.save_audio_from_base64(audio_base64)
                                    
                                    # 返回文件URL
                                    return file_manager.get_file_url(relative_path)
            except Exception as gemini_tts_error:
                print(f"Gemini TTS not available: {gemini_tts_error}")
                # 继续尝试其他方法
                pass
            
            # Fallback: 如果Gemini TTS不可用，返回空字符串
            # 在实际应用中，可以集成其他TTS服务（如Google Cloud TTS, OpenAI TTS等）
            print("TTS generation failed: Gemini TTS not available. Consider integrating Google Cloud TTS or other services.")
            return ""
            
        except Exception as e:
            print(f"TTS generation failed: {e}")
            return ""

ai_service = AIService()

