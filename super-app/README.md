# 超级应用 - Super App Platform

一个类似微信小程序的平台，允许用户通过应用市场下载和运行Web应用。

## 项目结构

```
super-app/
├── ARCHITECTURE.md          # 系统架构设计文档
├── README.md               # 本文件
├── android/                 # Android客户端
│   ├── app/
│   │   └── src/main/
│   │       └── java/com/superapp/
│   │           ├── data/         # 数据层（模型、本地存储、远程API）
│   │           ├── di/           # 依赖注入
│   │           ├── service/      # 服务层（下载管理、资源加载）
│   │           └── ui/           # UI层（Compose界面、ViewModel）
│   └── build.gradle.kts
├── server/                  # 后端API服务
│   └── src/
│       ├── controllers/    # 控制器
│       ├── middleware/     # 中间件
│       ├── models/         # 数据模型
│       ├── routes/         # 路由
│       └── index.js        # 入口文件
└── admin/                   # 管理后台前端
    └── src/
        ├── components/     # 组件
        ├── pages/          # 页面
        └── services/       # API服务
```

## 技术栈

### Android客户端
- Kotlin + Jetpack Compose
- MVVM + Clean Architecture
- Room Database (本地存储)
- Retrofit (网络请求)
- Hilt (依赖注入)
- WebView + shouldInterceptRequest (本地资源加载)

### 后端服务
- Node.js + Express
- MongoDB + Mongoose
- JWT认证
- Multer (文件上传)

### 管理后台
- React 18 + TypeScript
- Ant Design
- Vite

## 快速开始

### 1. 启动后端服务

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置MongoDB连接等

# 启动开发服务器
npm run dev
```

服务器将在 http://localhost:3000 启动

### 2. 启动管理后台

```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

管理后台将在 http://localhost:5173 启动

### 3. 构建Android应用

使用 Android Studio 打开 `android/` 目录，构建并运行应用。

## 核心功能

### Android客户端
- **应用市场**: 浏览和搜索可用应用
- **我的应用**: 管理已安装的应用
- **应用运行**: 通过WebView加载本地资源，实现接近原生的体验
- **本地资源拦截**: 使用 `shouldInterceptRequest` 从本地文件系统加载资源

### 后端API
- 应用CRUD操作
- 文件上传下载
- 应用包解析
- 下载统计

### 管理后台
- 应用发布和管理
- 状态管理（草稿/已发布/已归档）
- 数据统计

## 本地资源加载方案

采用 `shouldInterceptRequest` 方案：

1. 应用包(.zip)下载后解压到本地目录
2. WebView加载时使用自定义协议 `superapp://local/{appId}/`
3. 拦截所有资源请求，从本地文件系统读取
4. API请求透传到远程服务器

### 优势
- 无需启动本地HTTP服务器
- 资源加载路径可控
- 性能优秀，无网络开销

## Web应用包结构

```
my-app.zip
├── index.html           # 入口文件
├── manifest.json        # 应用清单
│   ├── name            # 应用名称
│   ├── version         # 版本号
│   ├── icon            # 图标路径
│   ├── description     # 描述
│   └── apiBaseUrl      # API基础地址（可选）
└── assets/             # 静态资源
```

## API接口

### 应用相关
- `GET /api/v1/apps` - 获取应用列表
- `GET /api/v1/apps/:id` - 获取应用详情
- `POST /api/v1/apps` - 创建应用（需认证）
- `PUT /api/v1/apps/:id` - 更新应用（需认证）
- `DELETE /api/v1/apps/:id` - 删除应用（需认证）
- `GET /api/v1/apps/:id/download` - 下载应用包

### 认证相关
- `POST /api/v1/auth/login` - 管理员登录
- `POST /api/v1/auth/register` - 管理员注册

## 配置说明

### Android客户端
- API地址配置: `ApiClient.kt` 中的 `BASE_URL`
- 存储路径: 应用内部存储 `apps/` 目录

### 后端服务
- 环境变量配置: `.env` 文件
- 上传目录: `uploads/`
- 数据库: MongoDB

## 安全考虑

1. 应用包验证: 上传时校验ZIP结构
2. 路径遍历防护: 解压时检查文件路径
3. JWT认证: 管理接口需要认证
4. 沙箱隔离: 每个Web应用独立WebView实例
