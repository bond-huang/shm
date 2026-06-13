# SHM - System Health Management

> 企业级服务器健康管理系统，一站式监控、巡检、分析运维平台

## 📖 项目简介

SHM（System Health Management）是一个全栈 Web 应用，用于集中管理和监控企业基础设施（AIX、Linux 主机），提供健康状态仪表盘、性能指标采集、自动巡检报告、脚本管理和数据分析等功能。

本项目自 2026 年 6 月 4 日起由 AI 驱动开发。

## ✨ 核心功能

### 🖥️ 主机管理
- 主机清单管理（AIX / Linux / Windows / AS400）
- 按用途、数据中心、系统类型多维度分类
- 主机详情页：系统信息、性能指标、巡检报告

### 📊 性能监控
- **实时采集**：通过 SSH 连接目标系统，实时获取 CPU、内存、磁盘、网络数据
- **历史趋势**：每 10 分钟自动采集，保留 24 小时历史数据，折线图展示
- **仪表盘**：CPU / Memory / Swap / FileSystem 四大指标仪表盘

### 🔍 自动巡检（Automatic PM）
- 一键执行 Linux 系统巡检脚本
- 自动生成 HTML 巡检报告（系统信息、错误日志、磁盘状态、进程分析等）
- 报告列表管理：查看、下载、删除
- 巡检脚本可视化查看、下载、编辑

### 📝 脚本库（Script Library）
- 脚本集中管理：上传 `.sh` / `.py` / `.sql` 等脚本文件
- 脚本分类：按系统（AIX / RHEL / Windows）和类型（System / Database / Network）筛选
- 脚本描述支持 Markdown 文档上传和渲染
- 脚本内容语法高亮（Shell / Python / SQL / Batch）

### 🔧 分析工具（Analytical Tools）
- **工具中心**：10 大工具分类（Analysis / Monitor / Inspect / Backup / Deploy / Operation / Optimize / Network / Security / Debug）
- **Analysis Tool**：7 个分析子类（Performance / Log / Network / Data / Config / Root Cause / Capacity）
- **SVC Performance Analysis**：上传 CSV 数据 + Python 脚本，生成 HTML 分析报告，支持下载

### 🤖 AI Assistant
- 预留 AI 智能运维助手入口

### 👤 用户管理
- 登录认证（JWT）
- 用户管理（管理员）
- 密码修改

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────┐
│                   前端 (Vue 3)               │
│  Vue 3 + Vue Router + Vuex + Element Plus   │
│  ECharts + Bootstrap Icons + Axios          │
├─────────────────────────────────────────────┤
│              Vue CLI Dev Server              │
│            (Proxy /api → :3000)              │
├─────────────────────────────────────────────┤
│               后端 (Node.js)                 │
│  Express 5 + JWT + SSH2 + Multer            │
│  Child Process (Python 脚本执行)             │
├─────────────────────────────────────────────┤
│               数据库 (MySQL)                 │
│  users / hosts / menus / cpu_performance     │
│  scripts / analyses / perf_history           │
├─────────────────────────────────────────────┤
│             目标服务器 (SSH)                  │
│  AIX / Linux / Windows 主机                  │
└─────────────────────────────────────────────┘
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 (Options API) + Vue Router 4 + Vuex 4 |
| **UI 框架** | Element Plus + Bootstrap Icons |
| **图表** | ECharts 5 (vue-echarts) |
| **HTTP** | Axios |
| **后端** | Node.js + Express 5 |
| **数据库** | MySQL 8 (mysql2/promise) |
| **认证** | JWT (jsonwebtoken + bcryptjs) |
| **远程连接** | SSH2 (远程主机采集) |
| **文件上传** | Multer |
| **脚本执行** | Child Process (Python) |
| **Markdown** | marked |

## 📁 项目结构

```
shm/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # 前端 API 接口
│   │   ├── login.js            # 登录认证
│   │   ├── demo.js             # 主机管理 + 脚本库
│   │   ├── dashboard.js        # 仪表盘
│   │   ├── menu.js             # 菜单
│   │   ├── perf.js             # 性能数据
│   │   └── user.js             # 用户管理
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   ├── Header/             # 顶部导航
│   │   ├── Aside/              # 侧边栏菜单
│   │   ├── Main/               # 面包屑 + 内容区
│   │   ├── hostpage/           # 主机详情组件（通用）
│   │   ├── AIXpage/            # AIX 专用组件
│   │   ├── Linuxpage/          # Linux 专用组件
│   │   └── pagination/         # 分页组件
│   ├── views/
│   │   ├── Login.vue           # 登录页
│   │   ├── Dashboard.vue       # 系统主页
│   │   ├── AllSystems.vue      # 主机列表
│   │   ├── CategoryList.vue    # 系统分类
│   │   ├── ScriptLibrary.vue   # 脚本库
│   │   ├── AllTool.vue         # 分析工具中心
│   │   ├── AIAssistant.vue     # AI 助手
│   │   └── tool/               # 分析工具子页面
│   ├── router/                 # 路由配置
│   ├── store/                  # Vuex 状态管理
│   ├── plugins/                # Axios + Element Plus 配置
│   └── permission.js           # 路由守卫
├── server/
│   ├── app.js                  # Express 入口
│   ├── config/db.js            # MySQL 连接池
│   ├── routes/                 # API 路由
│   │   ├── auth.js             # 登录认证
│   │   ├── hosts.js            # 主机 CRUD
│   │   ├── dashboard.js        # 仪表盘统计
│   │   ├── menu.js             # 菜单
│   │   ├── perf.js             # 性能数据
│   │   ├── perf-realtime.js    # 实时性能采集
│   │   ├── perf-history.js     # 历史性能查询
│   │   ├── reports.js          # 巡检报告
│   │   ├── scripts.js          # 脚本库 CRUD
│   │   ├── analysis.js         # 数据分析
│   │   └── users.js            # 用户管理
│   ├── services/
│   │   ├── sshService.js       # SSH 连接服务
│   │   ├── perfCollector.js    # 性能采集器
│   │   ├── inspection.js       # 巡检脚本定义
│   │   ├── reportGenerator.js  # 报告生成器
│   │   └── scheduler.js        # 定时采集调度
│   ├── scripts/                # 内置分析脚本
│   │   └── SVC-IOGRP-Perf.py
│   ├── reports/                # 生成的巡检报告
│   ├── uploads/                # 上传文件临时目录
│   └── sql/                    # 数据库脚本
│       ├── schema.sql          # 建表语句
│       └── seed.sql            # 初始数据
├── vue.config.js               # Vue CLI 配置
└── package.json
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Python 3.8+（分析工具需要）
- pip install openpyxl pandas matplotlib（Python 依赖）

### 1. 安装依赖
```bash
# 前端
npm install

# 后端
cd server
npm install
```

### 2. 初始化数据库
```bash
# 创建数据库和表
mysql -u root -p < server/sql/schema.sql

# 导入初始数据
mysql -u root -p shm < server/sql/seed.sql
```

### 3. 配置环境变量
```bash
# 编辑 server/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shm
JWT_SECRET=your-secret-key
PORT=3000
```

### 4. 启动服务
```bash
# 启动后端（端口 3000）
cd server
node app.js

# 启动前端（端口 8080）
npm run serve
```

### 5. 访问系统
- 前端地址：http://localhost:8080
- 默认账号：admin / 123456

## 📌 主要页面导航

| 菜单 | 功能 |
|------|------|
| **Dashboard** | 系统总览仪表盘 |
| **All Systems** | 主机列表（增删改查、状态筛选） |
| **System Class** | 主机分类（按用途 / 数据中心 / 系统类型） |
| **Host Detail** | 主机详情（系统信息、性能图表、巡检报告） |
| **Analytical Tools** | 分析工具中心（10 大分类） |
| **Script Library** | 脚本库管理 |
| **AI Assistant** | AI 智能助手（开发中） |
| **User Settings** | 用户管理 |

## 📋 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `hosts` | 主机表（含 SSH 凭据） |
| `menus` | 侧边栏菜单 |
| `cpu_performance` | CPU 性能历史数据 |
| `perf_history` | 实时性能采集历史（24h） |
| `scripts` | 脚本库 |
| `analyses` | 分析任务记录 |

## 🔐 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 用户登录 |
| `/api/allsystems` | GET/POST | 主机列表 |
| `/api/statistics` | GET | 仪表盘统计 |
| `/api/perf/realtime/:id` | GET | 实时性能采集 |
| `/api/perf/history/:id` | GET | 历史性能数据 |
| `/api/reports/generate/:id` | POST | 生成巡检报告 |
| `/api/scripts` | GET/POST | 脚本库 CRUD |
| `/api/analysis/run` | POST | 执行数据分析 |
| `/api/analysis/run-builtin` | POST | 执行内置分析脚本 |

## 📄 License

MIT

---

> 🤖 This project is AI-driven developed since June 4, 2026
