# Gemini API 图像生成实现方案

## 一、官方文档总结

### 1.1 快速入门文档总结
**来源**: [Gemini API 快速入门](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn)

#### 核心要点：

1. **SDK 安装**
   - 官方推荐使用新的 `google-genai` 包（不是 `google-generativeai`）
   - Python 安装命令：`pip install -q -U google-genai`
   - 需要 Python 3.9 及更高版本

2. **API 密钥配置**
   - 从 Google AI Studio 获取 API 密钥
   - 推荐使用环境变量 `GEMINI_API_KEY`
   - 客户端会自动从环境变量读取密钥

3. **基本调用方式**
   ```python
   from google import genai
   
   # 客户端自动从环境变量 GEMINI_API_KEY 获取密钥
   client = genai.Client()
   
   response = client.models.generate_content(
       model="gemini-2.5-flash",
       contents="Explain how AI works in a few words"
   )
   print(response.text)
   ```

4. **模型版本**
   - 推荐使用 `gemini-2.5-flash`（最新版本）
   - 其他可用模型：`gemini-1.5-flash`、`gemini-1.5-pro` 等

### 1.2 图像生成文档总结
**来源**: [Gemini API 图像生成](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn)

#### 核心要点：

1. **图像生成模型**
   - Gemini API 支持图像生成功能
   - 使用专门的图像生成模型（如 `nano-banana-001`）
   - 或使用支持多模态的 Gemini 模型

2. **调用方式**
   - 使用 `generate_content` 方法
   - 传入文本提示词（prompt）
   - 返回图像数据（base64 编码或二进制）

3. **响应处理**
   - 解析响应对象获取图像数据
   - 图像数据通常在 `response.candidates[0].content.parts` 中
   - 需要解码 base64 数据并保存为文件

4. **注意事项**
   - 图像生成可能需要较长时间
   - 需要处理超时和错误情况
   - 建议添加重试机制

## 二、当前项目状态分析

### 2.1 当前实现情况

1. **SDK 版本**
   - 当前使用：`google-generativeai==0.3.2`（旧版 SDK）
   - 官方推荐：`google-genai`（新版 SDK）
   - **问题**：版本不匹配，可能导致 API 调用方式不正确

2. **代码实现**
   - 文件：`backend/app/ai_service.py`
   - 当前使用：`genai.GenerativeModel('gemini-1.5-flash')`
   - 图像生成尝试：`gemini-2.0-flash-exp-image-generation`（可能不存在）

3. **遇到的问题**
   - 超时错误：`Timeout of 60.0s exceeded`
   - 连接错误：`503 failed to connect to all addresses`
   - 可能原因：
     - SDK 版本过旧
     - 模型名称不正确
     - API 调用方式不匹配

### 2.2 项目依赖分析

**当前 requirements.txt**:
```
google-generativeai==0.3.2  # 旧版 SDK
```

**需要更新为**:
```
google-genai>=1.0.0  # 新版 SDK（官方推荐）
```

## 三、适配方案

### 方案A：升级到新版 SDK（推荐）

#### 3.1 实施步骤

1. **更新依赖**
   ```bash
   pip uninstall google-generativeai
   pip install -U google-genai
   ```

2. **更新 requirements.txt**
   ```
   google-genai>=1.0.0
   ```

3. **修改代码实现**

   **文件**: `backend/app/ai_service.py`

   **修改前**（旧版 SDK）:
   ```python
   import google.generativeai as genai
   
   genai.configure(api_key=settings.gemini_api_key)
   
   class AIService:
       def __init__(self):
           self.model = genai.GenerativeModel('gemini-1.5-flash')
   ```

   **修改后**（新版 SDK）:
   ```python
   from google import genai
   
   class AIService:
       def __init__(self):
           # 客户端自动从环境变量 GEMINI_API_KEY 获取密钥
           # 或手动传入：client = genai.Client(api_key=settings.gemini_api_key)
           self.client = genai.Client(api_key=settings.gemini_api_key)
   ```

4. **更新图像生成方法**

   ```python
   async def generate_image(self, prompt: str) -> str:
       """生成训练图像"""
       try:
           # 构建完整的图像生成提示词
           full_prompt = f"{prompt}, flat vector illustration, minimalist, thick clean black outlines, high contrast, pure white background, low saturation colors, pastel blue and green palette, educational visual support style"
           
           # 使用新版 SDK 调用图像生成
           # 注意：需要确认正确的图像生成模型名称
           response = self.client.models.generate_content(
               model="nano-banana-001",  # 或使用支持图像生成的 Gemini 模型
               contents=full_prompt
           )
           
           # 提取图像数据
           if response and response.candidates:
               for candidate in response.candidates:
                   if candidate.content and candidate.content.parts:
                       for part in candidate.content.parts:
                           if hasattr(part, 'inline_data') and part.inline_data:
                               # 获取 base64 图像数据
                               image_base64 = part.inline_data.data
                               
                               # 保存图像文件
                               relative_path = file_manager.save_image_from_base64(image_base64)
                               
                               # 返回文件 URL
                               return file_manager.get_file_url(relative_path)
           
           # Fallback: 如果图像生成失败，使用 placeholder
           return self._get_fallback_image(prompt)
       except Exception as e:
           print(f"Image generation failed: {e}")
           return self._get_fallback_image(prompt)
   ```

5. **更新场景规划方法**

   ```python
   async def plan_scenario_steps(self, topic: str, preferences: dict = None) -> List[TrainingStepCreate]:
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
         "steps": [
           {{
             "step_order": 1,
             "instruction": "步骤说明",
             "image_prompt": "英文图像描述"
           }}
         ]
       }}
       """
       
       try:
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
           
           return [TrainingStepCreate(**step) for step in steps_data]
       except Exception as e:
           print(f"AI planning failed: {e}")
           # 返回默认步骤
           return [
               TrainingStepCreate(
                   step_order=1,
                   instruction=f"准备开始{topic}训练",
                   image_prompt=f"A child preparing for {topic} activity, simple illustration"
               ),
               # ... 其他默认步骤
           ]
   ```

#### 3.2 优势
- ✅ 使用官方最新 SDK，API 调用方式正确
- ✅ 更好的错误处理和超时控制
- ✅ 支持最新的模型和功能
- ✅ 官方文档完善，易于维护

#### 3.3 注意事项
- ⚠️ 需要确认图像生成模型名称（可能是 `nano-banana-001` 或其他）
- ⚠️ 需要测试网络连接（可能需要 VPN）
- ⚠️ 需要更新所有使用旧 SDK 的代码

### 方案B：保持旧版 SDK，优化调用方式

#### 3.1 实施步骤

1. **保持当前依赖**
   ```
   google-generativeai==0.3.2
   ```

2. **优化图像生成方法**
   - 添加重试机制
   - 增加超时时间
   - 改进错误处理
   - 使用正确的模型名称

3. **代码优化示例**

   ```python
   import asyncio
   from tenacity import retry, stop_after_attempt, wait_exponential
   
   async def generate_image(self, prompt: str) -> str:
       """生成训练图像"""
       @retry(
           stop=stop_after_attempt(3),
           wait=wait_exponential(multiplier=1, min=4, max=10)
       )
       async def _generate_with_retry():
           try:
               full_prompt = f"{prompt}, flat vector illustration, minimalist, thick clean black outlines, high contrast, pure white background, low saturation colors, pastel blue and green palette, educational visual support style"
               
               # 使用较长的超时时间
               response = await asyncio.wait_for(
                   asyncio.to_thread(
                       self.model.generate_content,
                       full_prompt
                   ),
                   timeout=120.0  # 增加到 120 秒
               )
               
               # 处理响应...
               return self._get_fallback_image(prompt)
           except asyncio.TimeoutError:
               print("Image generation timeout")
               raise
           except Exception as e:
               print(f"Image generation error: {e}")
               raise
       
       try:
           return await _generate_with_retry()
       except Exception:
           return self._get_fallback_image(prompt)
   ```

#### 3.2 优势
- ✅ 无需修改依赖
- ✅ 改动较小
- ✅ 可以快速实施

#### 3.3 缺点
- ❌ 仍使用旧版 SDK，可能不支持最新功能
- ❌ 可能无法解决根本问题（模型不存在或 API 调用方式错误）

## 四、推荐实施路径

### 4.1 阶段一：验证和测试（1-2天）

1. **测试网络连接**
   - 确认能否访问 Google API
   - 测试 API 密钥是否有效

2. **测试新版 SDK**
   - 在测试环境中安装 `google-genai`
   - 测试基本的文本生成功能
   - 验证 API 密钥配置

3. **查找正确的图像生成模型**
   - 查阅官方文档
   - 测试不同的模型名称
   - 确认图像生成 API 的可用性

### 4.2 阶段二：代码迁移（2-3天）

1. **升级 SDK**
   - 更新 `requirements.txt`
   - 安装新版 SDK
   - 更新 `ai_service.py` 中的导入和初始化

2. **更新方法实现**
   - 修改 `plan_scenario_steps` 方法
   - 修改 `generate_image` 方法
   - 添加错误处理和日志

3. **测试验证**
   - 单元测试
   - 集成测试
   - 端到端测试

### 4.3 阶段三：优化和部署（1-2天）

1. **性能优化**
   - 添加缓存机制
   - 优化超时设置
   - 添加重试逻辑

2. **错误处理**
   - 完善错误信息
   - 添加 fallback 机制
   - 记录错误日志

3. **文档更新**
   - 更新 API 文档
   - 更新部署文档
   - 更新使用说明

## 五、关键注意事项

### 5.1 API 密钥安全
- ✅ 使用环境变量存储 API 密钥
- ✅ 不要在代码中硬编码密钥
- ✅ 使用 `.env` 文件（不提交到 Git）

### 5.2 网络访问
- ⚠️ 国内可能需要 VPN 或代理
- ⚠️ 配置代理设置（如需要）
- ⚠️ 处理网络超时和重试

### 5.3 成本控制
- ⚠️ 图像生成 API 调用有成本
- ⚠️ 建议添加使用量监控
- ⚠️ 考虑添加缓存避免重复生成

### 5.4 错误处理
- ✅ 所有 API 调用都要有 try-catch
- ✅ 提供友好的错误信息
- ✅ 实现 fallback 机制（使用 placeholder 图片）

## 六、测试计划

### 6.1 单元测试
- 测试 `generate_image` 方法
- 测试 `plan_scenario_steps` 方法
- 测试错误处理逻辑

### 6.2 集成测试
- 测试完整的图像生成流程
- 测试文件保存和 URL 生成
- 测试 API 响应处理

### 6.3 端到端测试
- 前端调用图像生成 API
- 验证图像显示
- 测试错误场景

## 七、参考资料

1. [Gemini API 快速入门](https://ai.google.dev/gemini-api/docs/quickstart?hl=zh-cn)
2. [Gemini API 图像生成](https://ai.google.dev/gemini-api/docs/image-generation?hl=zh-cn)
3. [Google AI Studio](https://aistudio.google.com/)
4. [Gemini API 文档](https://ai.google.dev/gemini-api/docs)

## 八、下一步行动

1. **立即执行**：
   - 在测试环境安装新版 SDK
   - 测试基本的 API 调用
   - 确认网络连接和 API 密钥

2. **短期计划**（本周内）：
   - 完成 SDK 升级
   - 更新代码实现
   - 进行测试验证

3. **长期优化**：
   - 添加缓存机制
   - 优化性能
   - 完善错误处理

---

**文档创建时间**: 2025-01-XX  
**最后更新时间**: 2025-01-XX  
**维护者**: 开发团队

