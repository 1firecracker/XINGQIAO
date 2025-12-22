"""
图像生成功能测试脚本
用于验证Gemini API图像生成功能是否正常工作
"""
import asyncio
import os
from app.ai_service import AIService

async def test_image_generation():
    """测试图像生成功能"""
    # 检查API密钥
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("警告: 未设置GEMINI_API_KEY环境变量")
        print("请设置环境变量: $env:GEMINI_API_KEY='your-api-key'")
        return
    
    print("开始测试图像生成功能...")
    print(f"API密钥已设置: {api_key[:10]}...")
    
    # 创建AI服务实例
    ai_service = AIService()
    
    # 测试提示词
    test_prompt = "a cute cat playing with a ball"
    print(f"\n测试提示词: {test_prompt}")
    
    try:
        # 生成图像
        print("\n正在生成图像...")
        image_url = await ai_service.generate_image(test_prompt)
        
        print(f"\n图像生成完成!")
        print(f"图像URL: {image_url}")
        
        # 检查文件是否存在
        if image_url.startswith("/files/"):
            # 提取文件路径
            relative_path = image_url.replace("/files/", "")
            file_path = os.path.join("uploads", relative_path)
            
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                print(f"文件已保存: {file_path}")
                print(f"文件大小: {file_size} bytes")
                print("✓ 图像生成和保存成功!")
            else:
                print(f"警告: 文件不存在: {file_path}")
        elif "placehold.co" in image_url:
            print("⚠ 使用了fallback placeholder图片（API可能不可用或模型不存在）")
        else:
            print(f"未知的URL格式: {image_url}")
            
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_image_generation())


