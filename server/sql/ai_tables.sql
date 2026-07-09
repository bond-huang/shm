-- AI 模型配置表
CREATE TABLE IF NOT EXISTS ai_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model_name VARCHAR(50) NOT NULL COMMENT '模型名称(显示用)',
  api_base_url VARCHAR(255) NOT NULL COMMENT 'API 基础地址',
  api_key VARCHAR(255) NOT NULL COMMENT 'API Key',
  model_id VARCHAR(100) NOT NULL COMMENT '模型ID(如 deepseek-chat)',
  is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模型',
  status TINYINT(1) DEFAULT 1 COMMENT '1启用 0禁用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 对话会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) DEFAULT 'New Chat',
  model_config_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (model_config_id) REFERENCES ai_configs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 对话消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  role ENUM('user','assistant','system') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 预置模型配置
INSERT INTO ai_configs (model_name, api_base_url, api_key, model_id, is_default, status) VALUES
('DeepSeek', 'https://api.deepseek.com', '', 'deepseek-chat', 1, 1),
('通义千问', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '', 'qwen-turbo', 0, 1),
('智谱GLM', 'https://open.bigmodel.cn/api/paas/v4', '', 'glm-4-flash', 0, 1),
('OpenAI', 'https://api.openai.com/v1', '', 'gpt-3.5-turbo', 0, 1);
