# SHM 后端服务

基于 Node.js + Express + MySQL 的系统健康监控平台后端。

## 环境要求

- Node.js >= 14
- MySQL >= 5.7

## 安装步骤

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置数据库

编辑 `.env` 文件，修改数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shm
JWT_SECRET=your-secret-key
PORT=3000
```

### 3. 初始化数据库

```bash
# 登录 MySQL 执行建表脚本
mysql -u root -p < sql/schema.sql

# 导入初始数据
mysql -u root -p < sql/seed.sql
```

### 4. 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

服务将在 http://localhost:3000 启动。

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/login | 用户登录 |
| GET | /api/menu | 获取菜单树 |
| GET | /api/allsystems | 查询主机列表（分页） |
| POST | /api/allsystems | 新增主机 |
| PUT | /api/allsystems/:id | 更新主机 |
| DELETE | /api/allsystems/:id | 删除主机 |
| GET | /api/statistics | 主机状态统计 |
| GET | /api/cpuperf | CPU 性能数据 |
| GET | /api/health | 健康检查 |

## 默认账号

- 用户名: admin
- 密码: 123456
