-- SHM 数据库建表脚本
-- 最后更新: 2026-06-08 (与代码完全同步)
CREATE DATABASE IF NOT EXISTS shm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shm;

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' COMMENT 'admin / user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 菜单表
-- ============================================================
CREATE TABLE IF NOT EXISTS menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  menu_id VARCHAR(20) NOT NULL UNIQUE,
  parent_id VARCHAR(20) DEFAULT NULL,
  menu_type TINYINT NOT NULL COMMENT '1=分组, 2=叶子',
  menu_name VARCHAR(100) NOT NULL,
  path VARCHAR(200) DEFAULT NULL,
  sort_order INT DEFAULT 0
);

-- ============================================================
-- 主机表
-- ============================================================
CREATE TABLE IF NOT EXISTS hosts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host_type VARCHAR(20) NOT NULL COMMENT 'AIX / Linux / Windows / AS400',
  host_name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  description VARCHAR(200) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'Health' COMMENT 'Health / Warning / Severe',
  category VARCHAR(50) DEFAULT '' COMMENT '系统分类',
  business_name VARCHAR(100) DEFAULT '' COMMENT '业务名称',
  data_center VARCHAR(100) DEFAULT '' COMMENT '数据中心',
  ssh_user VARCHAR(100) DEFAULT NULL COMMENT 'SSH 登录用户',
  ssh_password VARCHAR(255) DEFAULT NULL COMMENT 'SSH 登录密码',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- CPU 性能数据表 (旧版 24 小时桶格式，保留兼容)
-- ============================================================
CREATE TABLE IF NOT EXISTS cpu_performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host_id INT,
  metric_name VARCHAR(20) NOT NULL COMMENT 'user/sys/idle/iowait/entc',
  metric_date DATE NOT NULL,
  hour_0 DOUBLE DEFAULT 0,
  hour_1 DOUBLE DEFAULT 0,
  hour_2 DOUBLE DEFAULT 0,
  hour_3 DOUBLE DEFAULT 0,
  hour_4 DOUBLE DEFAULT 0,
  hour_5 DOUBLE DEFAULT 0,
  hour_6 DOUBLE DEFAULT 0,
  hour_7 DOUBLE DEFAULT 0,
  hour_8 DOUBLE DEFAULT 0,
  hour_9 DOUBLE DEFAULT 0,
  hour_10 DOUBLE DEFAULT 0,
  hour_11 DOUBLE DEFAULT 0,
  hour_12 DOUBLE DEFAULT 0,
  hour_13 DOUBLE DEFAULT 0,
  hour_14 DOUBLE DEFAULT 0,
  hour_15 DOUBLE DEFAULT 0,
  hour_16 DOUBLE DEFAULT 0,
  hour_17 DOUBLE DEFAULT 0,
  hour_18 DOUBLE DEFAULT 0,
  hour_19 DOUBLE DEFAULT 0,
  hour_20 DOUBLE DEFAULT 0,
  hour_21 DOUBLE DEFAULT 0,
  hour_22 DOUBLE DEFAULT 0,
  hour_23 DOUBLE DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE SET NULL
);

-- ============================================================
-- 实时性能采集历史表 (每 10 分钟自动采集，保留 24 小时)
-- ============================================================
CREATE TABLE IF NOT EXISTS perf_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host_id INT NOT NULL,
  metric_type VARCHAR(20) NOT NULL COMMENT 'cpu / memory / disk / network',
  metric_name VARCHAR(50) NOT NULL COMMENT 'user/system/idle/iowait/memUsed/swapUsed/usePercent/rxBytes/txBytes 等',
  metric_value DOUBLE NOT NULL DEFAULT 0,
  extra_info VARCHAR(100) DEFAULT NULL COMMENT '磁盘挂载点 / 网卡名等附加信息',
  collected_at DATETIME NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE INDEX idx_perf_history_host ON perf_history(host_id, collected_at);
CREATE INDEX idx_perf_history_time ON perf_history(collected_at);

-- ============================================================
-- 脚本库表
-- ============================================================
CREATE TABLE IF NOT EXISTS scripts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL UNIQUE COMMENT '脚本名称',
  introduction VARCHAR(500) DEFAULT '' COMMENT '简要介绍',
  run_system VARCHAR(50) NOT NULL COMMENT '运行系统: AIX / RHEL / Windows 等',
  script_type VARCHAR(50) NOT NULL COMMENT '脚本类型: System / Database / Network 等',
  description TEXT COMMENT '详细描述 (Markdown)',
  script_content LONGTEXT COMMENT '脚本内容',
  filename VARCHAR(255) DEFAULT '' COMMENT '上传文件名',
  description_file VARCHAR(255) DEFAULT NULL COMMENT '描述文件名',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 数据分析任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS analyses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) DEFAULT 'Analysis' COMMENT '任务名称',
  description TEXT COMMENT '任务描述',
  csv_filename VARCHAR(255) NOT NULL COMMENT '上传的 CSV 文件名',
  script_filename VARCHAR(255) NOT NULL COMMENT '分析脚本文件名',
  status VARCHAR(20) NOT NULL DEFAULT 'running' COMMENT 'running / completed / failed',
  result_html LONGTEXT COMMENT '分析结果 HTML',
  error_msg TEXT COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
