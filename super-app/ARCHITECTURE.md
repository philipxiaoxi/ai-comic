# 超级应用 - 系统架构设计

## 1. 系统概述

超级应用是一个类似微信小程序的平台，允许用户通过应用市场下载和运行Web应用。核心特点是将Web应用打包成本地资源，通过本地加载实现接近原生的用户体验。

## 2. 技术栈

### Android客户端
- **语言**: Kotlin
- **UI框架**: Jetpack Compose
- **架构模式**: MVVM + Clean Architecture
- **网络库**: Retrofit + OkHttp
- **本地存储**: Room Database
- **依赖注入**: Hilt
- **WebView**: 自定义WebViewClient实现本地资源拦截

### 后端服务
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **文件存储**: 本地文件系统 (可扩展至OSS)
- **认证**: JWT

### 管理后台
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design
- **构建工具**: Vite
- **状态管理**: React Context

## 3. 核心架构设计

### 3.1 Android客户端架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Compose)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │  AppMarket   │  │   MyApps    │  │   AppRunner  │    │
│  │   Screen     │  │   Screen    │  │   (WebView)  │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘    │
│         │                │                 │            │
├─────────┴────────────────┴─────────────────┴────────────┤
│                  ViewModel Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │MarketVM      │  │MyAppsVM     │  │AppRunnerVM   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘    │
│         │                │                 │            │
├─────────┴────────────────┴─────────────────┴────────────┤
│                   Data Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │AppRepository │  │DownloadMgr  │  │LocalServer   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘    │
│         │                │                 │            │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴───────┐    │
│  │RemoteAPI     │  │RoomDB       │  │FileSystem    │    │
│  └─────────────┘  └─────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 本地资源加载方案

**方案选择: WebView + shouldInterceptRequest**

采用WebView的`shouldInterceptRequest`方法拦截资源请求，直接从本地文件系统读取并返回，无需启动本地HTTP服务器。

**优势:**
- 无需额外的服务器进程
- 资源加载路径可控
- 支持自定义协议
- 性能优秀，无网络开销

**实现流程:**
1. 用户从应用市场下载Web应用包(.zip)
2. 解压到本地存储目录 `/data/data/com.superapp/apps/{appId}/`
3. WebView加载时，通过`shouldInterceptRequest`拦截所有请求
4. 将请求URL映射到本地文件路径
5. 读取本地文件并返回WebResourceResponse

**请求地址配置:**
- Web应用通过`manifest.json`声明API基础地址
- 支持运行时动态配置
- 提供JavaScript Bridge供Web应用调用原生功能

### 3.3 后端API设计

```
/api/v1/
├── /apps
│   ├── GET /              # 获取应用列表（市场）
│   ├── GET /:id           # 获取应用详情
│   ├── POST /             # 上传新应用
│   ├── PUT /:id           # 更新应用信息
│   └── DELETE /:id        # 删除应用
├── /apps/:id/download     # 下载应用包
├── /apps/:id/versions     # 版本管理
├── /auth
│   ├── POST /login        # 管理员登录
│   └── POST /register     # 管理员注册
└── /config
    └── GET /api-base-url  # 获取API配置
```

### 3.4 Web应用包结构

```
my-app.zip
├── index.html           # 入口文件
├── manifest.json        # 应用清单
│   ├── name            # 应用名称
│   ├── version         # 版本号
│   ├── icon            # 图标路径
│   ├── description     # 描述
│   ├── apiBaseUrl      # API基础地址（可选）
│   └── permissions     # 所需权限
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
└── ...
```

## 4. 数据模型

### App (应用)
```json
{
  "_id": "ObjectId",
  "name": "应用名称",
  "description": "应用描述",
  "version": "1.0.0",
  "icon": "icon_url",
  "packageUrl": "package_url",
  "packageSize": 1024000,
  "status": "published | draft | archived",
  "developer": "开发者名称",
  "category": "分类",
  "downloadCount": 0,
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### InstalledApp (已安装应用)
```kotlin
@Entity(tableName = "installed_apps")
data class InstalledApp(
    @PrimaryKey val appId: String,
    val name: String,
    val icon: String,
    val version: String,
    val installPath: String,
    val installedAt: Long,
    val lastOpenedAt: Long
)
```

## 5. 安全考虑

1. **应用包验证**: 上传时校验包结构和文件类型
2. **沙箱隔离**: 每个Web应用运行在独立的WebView实例中
3. **权限控制**: Web应用需声明所需权限
4. **HTTPS通信**: API通信强制使用HTTPS
5. **JWT认证**: 管理后台使用JWT进行身份验证
