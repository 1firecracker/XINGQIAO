import os
import uuid
import base64
from pathlib import Path
from typing import Optional

class FileManager:
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

        # 创建子目录
        self.images_dir = self.upload_dir / "images"
        self.audio_dir = self.upload_dir / "audio"
        self.images_dir.mkdir(exist_ok=True)
        self.audio_dir.mkdir(exist_ok=True)

    def save_image(self, image_data, filename: Optional[str] = None) -> str:
        """保存图像数据（支持bytes或base64字符串），返回相对路径用于URL生成"""
        if not filename:
            filename = f"{uuid.uuid4()}.png"

        filepath = self.images_dir / filename

        # 处理不同类型的数据
        if isinstance(image_data, bytes):
            # 如果已经是bytes，直接保存
            image_bytes = image_data
        elif isinstance(image_data, str):
            # 如果是字符串，可能是base64编码
            # 移除base64前缀（如果有）
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            # 解码base64字符串
            image_bytes = base64.b64decode(image_data)
        else:
            # 尝试转换为bytes
            image_bytes = bytes(image_data)

        # 保存文件
        with open(filepath, 'wb') as f:
            f.write(image_bytes)

        # 返回相对路径（相对于upload_dir）
        relative_path = filepath.relative_to(self.upload_dir)
        return str(relative_path)

    def save_image_from_base64(self, base64_data: str, filename: Optional[str] = None) -> str:
        """保存base64图像数据（向后兼容），返回相对路径用于URL生成"""
        return self.save_image(base64_data, filename)

    def save_audio_from_base64(self, base64_data: str, filename: Optional[str] = None) -> str:
        """保存base64音频数据，返回相对路径用于URL生成"""
        if not filename:
            filename = f"{uuid.uuid4()}.mp3"

        filepath = self.audio_dir / filename

        # 移除base64前缀（如果有）
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]

        # 解码并保存
        audio_data = base64.b64decode(base64_data)
        with open(filepath, 'wb') as f:
            f.write(audio_data)

        # 返回相对路径（相对于upload_dir）
        relative_path = filepath.relative_to(self.upload_dir)
        return str(relative_path)

    def get_file_url(self, filepath: str) -> str:
        """获取文件访问URL"""
        # #region agent log
        import json
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"file_manager.py:get_file_url","message":"Generating file URL","data":{"input_filepath":filepath,"has_backslash":"\\" in str(filepath)},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"post-fix","hypothesisId":"B"})+'\n')
        # #endregion
        # 如果filepath是绝对路径，转换为相对路径
        filepath_obj = Path(filepath)
        if filepath_obj.is_absolute():
            # 尝试获取相对于upload_dir的路径
            try:
                relative_path = filepath_obj.relative_to(self.upload_dir)
                # 将Windows路径分隔符转换为URL路径分隔符
                url_path = str(relative_path).replace('\\', '/')
                final_url = f"/files/{url_path}"
                # #region agent log
                with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"location":"file_manager.py:get_file_url","message":"File URL generated (absolute path)","data":{"relative_path":str(relative_path),"url_path":url_path,"final_url":final_url,"has_backslash_in_url":"\\" in final_url},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"post-fix","hypothesisId":"B"})+'\n')
                # #endregion
                return final_url
            except ValueError:
                # 如果无法获取相对路径，返回文件名
                return f"/files/{filepath_obj.name}"
        # 将Windows路径分隔符转换为URL路径分隔符
        url_path = filepath.replace('\\', '/')
        final_url = f"/files/{url_path}"
        # #region agent log
        with open('d:\\AAAPyCharm_project\\XINGQIAO\\XINGQIAO\\.cursor\\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"location":"file_manager.py:get_file_url","message":"File URL generated (relative path)","data":{"input_filepath":filepath,"url_path":url_path,"final_url":final_url,"has_backslash_in_url":"\\" in final_url},"timestamp":__import__('time').time()*1000,"sessionId":"debug-session","runId":"post-fix","hypothesisId":"B"})+'\n')
        # #endregion
        return final_url

    def cleanup_old_files(self, days: int = 7):
        """清理旧文件"""
        import time
        current_time = time.time()

        for file_path in self.upload_dir.rglob("*"):
            if file_path.is_file():
                if current_time - file_path.stat().st_mtime > days * 24 * 3600:
                    file_path.unlink()

file_manager = FileManager()

