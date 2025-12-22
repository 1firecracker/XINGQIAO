# 🌉 星桥 (Star Bridge) - 特教场景生图训练系统

## 📖 项目简介

**星桥**是一个专为特殊教育设计的场景化AI生图与行为训练闭环应用。通过高对比度、低刺激、视觉锚点明确的AI生成图像，辅助孤独症等特需儿童进行社交与生活技能训练。

### ✨ 核心特性

- 🤖 **AI驱动的场景生成**：基于Google Gemini AI自动生成个性化训练场景
- 🎨 **视觉化训练支持**：高对比度、低刺激的视觉辅助图像
- 🔊 **语音引导**：TTS语音指导，支持多种音色选择
- 📊 **数据分析**：训练进度追踪和表现统计
- 🎯 **个性化定制**：根据儿童兴趣和偏好定制训练内容
- 📱 **响应式设计**：专为移动设备优化的用户体验

### 🚀 快速开始

#### 前置要求

- Node.js 18+
- npm 或 yarn
- Google Gemini API 密钥

#### 本地运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd XINGQIAO
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**

   创建 `.env.local` 文件并设置API密钥：
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**

   在浏览器中打开 [http://localhost:5173](http://localhost:5173)

### 🏗️ 系统架构

当前版本为纯前端应用，使用以下技术栈：

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI样式**: Tailwind CSS
- **AI服务**: Google Gemini AI
- **状态管理**: React Hooks + localStorage
- **图表库**: Recharts

### 📁 项目结构

```
XINGQIAO/
├── components/          # React 组件
│   ├── Dashboard.tsx    # 数据统计面板
│   ├── FeedbackView.tsx # 训练反馈界面
│   ├── Header.tsx       # 页面头部
│   ├── ScenarioCard.tsx # 场景卡片
│   ├── Settings.tsx     # 设置页面
│   └── TrainingSession.tsx # 训练会话
├── docs/               # 项目文档
├── public/             # 静态资源
├── src/                # 源码目录
│   ├── App.tsx         # 主应用组件
│   ├── constants.tsx   # 常量配置
│   ├── geminiService.ts # AI 服务
│   ├── index.tsx       # 应用入口
│   ├── types.ts        # TypeScript 类型定义
│   └── vite.config.ts  # Vite 配置
├── package.json        # 项目配置
└── README.md          # 项目说明
```

### 🎯 主要功能

#### 场景训练
- **预设场景**: 超市排队、刷牙洗漱、过马路等生活场景
- **AI生成场景**: 输入任意主题，AI自动规划训练步骤
- **个性化定制**: 根据儿童兴趣调整训练内容

#### 数据统计
- 训练历史记录
- 完成度统计
- 进度追踪图表

#### 用户设置
- 儿童姓名设置
- 兴趣偏好配置
- 语音音色选择
- 背景音乐设置

### 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

### 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: your-email@example.com

---

## 🚀 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (可选)

### 本地开发

#### 后端启动

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 设置环境变量
export GEMINI_API_KEY=your_api_key_here  # Windows: set GEMINI_API_KEY=your_api_key_here

# 启动服务
uvicorn app.main:app --reload --port 8000
```

#### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### Docker部署

```bash
# 复制环境变量文件
cp env-example.txt .env
# 编辑.env文件设置GEMINI_API_KEY

# 一键启动
docker-compose up --build

# 访问应用
# 前端: http://localhost:3000
# API文档: http://localhost:8000/docs
```

## 📋 实施计划

项目已按照[实施计划文档](./docs/实施计划.md)完成前后端分离重构，包括：

- ✅ Phase 1: 基础搭建 - FastAPI后端 + React前端架构
- ✅ Phase 2: 核心功能 - 数据模型、API接口、AI服务集成
- ✅ Phase 3: 集成测试 - 单元测试和集成测试
- ✅ Phase 4: 文件存储 - 文件管理和缓存策略
- ✅ Phase 5: 部署演示 - Docker容器化部署

详细实施步骤请参考 [实施计划文档](./docs/实施计划.md)。
