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
1. 清晰简洁的指令（中文，必须是6字以内的短指令，符合自闭症儿童的认知特点）
2. 对应的视觉提示词（英文，用于生成图像）

指令（instruction）的格式要求：
- 必须是6字以内的短指令，例如："站到队尾"、"举起手"、"说你好"
- 使用动词开头的动作指令，直接明确，避免冗长描述
- 不要使用解释性语言，只给出核心动作指令
- 每条指令只包含一个清晰可执行的核心动作，不要把多个动作合在一起
- 符合自闭症儿童认知特点：简洁、直接、可执行

视觉提示词（image_prompt）的格式要求：
- 必须是简短的英文描述句（尽量控制在10-15个单词以内），但必须包含任务背景/场景上下文
- 每张图片必须明确显示当前动作是在什么任务/场景中完成的，例如："child turning head left to check traffic while crossing street" 而不是 "child turning head left"
- 任务背景要简洁明确，用1-3个关键词说明场景（如：crossing street, waiting in line, raising hand in classroom）
- 每张图片只表现一个核心动作，只描述当前步骤的动作，不要描述前后步骤
- 每张图片中最多只包含一个儿童角色，如果可以用物体或场景表达，可以不画人物
- 如果出现儿童角色，画面中只能有这一个孩子，不要有其他人物或背景人群
- 背景必须简洁干净，避免人群、复杂环境和拥挤场景
- 只描述具体动作和物体，不要使用比喻、抽象修辞或隐喻
- 不要在image_prompt中指定绘画风格、颜色风格或画风（这些由系统统一控制）
- 禁止在图片中生成任何文字、字母、数字、标签、对话气泡、符号、图标或Logo
- 画面风格为极简线条风格（minimalist black line art），使用极简黑色线条勾勒
- 场景中只保留与当前动作直接相关的物体，不画任何装饰性元素
- 内容必须温和、安全，适合自闭症儿童，避免暴力、恐怖或刺激性元素
- 重要：image_prompt格式为"动作 + 任务背景"，例如："child standing at crosswalk edge" 或 "child raising hand in classroom"

请以JSON格式返回，格式如下：
{{
  "total_images": 3,
  "steps": [
    {{
      "step_order": 1,
      "instruction": "步骤说明",
      "image_prompt": "child [动作] [任务背景场景]，例如：child standing at crosswalk edge 或 child raising hand in classroom"
    }}
  ]
}}

image_prompt示例（主题：过马路）：
- 步骤1："child standing still at crosswalk edge"
- 步骤2："child turning head left to check traffic while crossing street"
- 步骤3："child walking straight on crosswalk"

注意：每个image_prompt都必须包含任务背景（crosswalk, street, classroom等场景关键词）

注意：
- total_images必须等于steps数组的长度
- 确保steps数组中的step_order字段与数组索引匹配（从1开始）
- instruction必须严格遵守6字以内的格式要求
- image_prompt必须严格遵守上述格式要求
"""

        try:
            if not self.client:
                raise Exception("API client not initialized")
            # 使用新版SDK的API调用方式，添加超时和重试
            import time
            max_retries = 2
            retry_delay = 1  # 秒
            
            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt
                    )
                    break  # 成功则跳出重试循环
                except Exception as retry_error:
                    if attempt < max_retries - 1:
                        error_msg = str(retry_error)
                        if "EOF" in error_msg or "SSL" in error_msg or "protocol" in error_msg:
                            print(f"SSL/连接错误，{retry_delay}秒后重试 (尝试 {attempt + 1}/{max_retries})...")
                            time.sleep(retry_delay)
                            continue
                    raise  # 最后一次尝试失败或非SSL错误，抛出异常
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

            print(f"AI规划完成：将生成 {total_images} 张训练图片")
            return {
                'total_images': total_images,
                'steps': [TrainingStepCreate(**step) for step in steps_data]
            }
        except Exception as e:
            print(f"AI planning failed: {e}")
            # 返回默认步骤（使用6字内的短指令）
            default_steps = [
                TrainingStepCreate(
                    step_order=1,
                    instruction="准备开始",
                    image_prompt=f"A child preparing for {topic} activity, simple illustration"
                ),
                TrainingStepCreate(
                    step_order=2,
                    instruction="执行步骤",
                    image_prompt=f"A child performing {topic} activity, clear visual guide"
                ),
                TrainingStepCreate(
                    step_order=3,
                    instruction="完成训练",
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
        print(f"[图片生成] 提示词: {prompt}")
        try:
            # 前端已构建完整的图像生成提示词，直接使用
            # 使用新版SDK调用图像生成模型
            try:
                if not self.client:
                    raise Exception("API client not initialized")
                # 使用gemini-2.5-flash-image模型生成图像
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash-image",
                    contents=prompt
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
                                    image_url = file_manager.get_file_url(relative_path)
                                    print(f"[图片生成] 成功生成图片: {image_url}")
                                    return image_url
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

