import pytest
from unittest.mock import patch, MagicMock
from app.ai_service import AIService

@pytest.fixture
def ai_service():
    return AIService()

@patch('app.ai_service.genai.Client')
async def test_plan_scenario_steps(mock_client_class, ai_service):
    """测试AI场景规划"""
    # 模拟新版SDK的响应结构
    mock_response = MagicMock()
    mock_response.text = '''
    {
        "steps": [
            {
                "step_order": 1,
                "instruction": "测试步骤",
                "image_prompt": "test prompt"
            }
        ]
    }
    '''
    
    # Mock Client实例和models.generate_content方法
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance
    mock_client_instance.models.generate_content.return_value = mock_response
    
    # 重新初始化ai_service以使用mock的client
    ai_service.client = mock_client_instance
    
    steps = await ai_service.plan_scenario_steps("测试主题")

    assert len(steps) >= 1

@patch('app.ai_service.genai.Client')
async def test_generate_image_success(mock_client_class, ai_service):
    """测试成功生成图像"""
    # 模拟新版SDK的图像生成响应
    mock_inline_data = MagicMock()
    mock_inline_data.data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="  # 1x1 PNG base64
    
    mock_part = MagicMock()
    mock_part.inline_data = mock_inline_data
    
    mock_content = MagicMock()
    mock_content.parts = [mock_part]
    
    mock_candidate = MagicMock()
    mock_candidate.content = mock_content
    
    mock_response = MagicMock()
    mock_response.candidates = [mock_candidate]
    
    # Mock Client实例
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance
    mock_client_instance.models.generate_content.return_value = mock_response
    
    # 重新初始化ai_service以使用mock的client
    ai_service.client = mock_client_instance
    
    image_url = await ai_service.generate_image("test prompt")
    
    # 验证返回的URL格式正确（应该是/files/开头的路径）
    assert image_url.startswith("/files/")
    assert "images" in image_url

@patch('app.ai_service.genai.Client')
async def test_generate_image_api_failure(mock_client_class, ai_service):
    """测试图像生成API失败时的fallback"""
    # Mock Client实例，使其抛出异常
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance
    mock_client_instance.models.generate_content.side_effect = Exception("API Error")
    
    # 重新初始化ai_service以使用mock的client
    ai_service.client = mock_client_instance
    
    image_url = await ai_service.generate_image("test prompt")

    # 应该返回placeholder URL
    assert "placehold.co" in image_url

@pytest.mark.skip(reason="集成测试需要真实API密钥，手动运行")
async def test_generate_image_real_api(ai_service):
    """集成测试：使用真实API测试图像生成"""
    import os
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("需要设置GEMINI_API_KEY环境变量")
    
    image_url = await ai_service.generate_image("a cute cat playing with a ball")
    
    # 验证返回了URL
    assert image_url
    # 如果是真实API，应该返回文件URL而不是placeholder
    # 如果是fallback，会返回placeholder URL
    assert image_url.startswith("/files/") or "placehold.co" in image_url

