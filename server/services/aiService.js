/**
 * AI 大模型统一服务
 * 兼容 OpenAI API 格式：DeepSeek、通义千问、智谱GLM、OpenAI、Claude 等
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * 发送聊天请求（非流式）
 * @param {object} config - 模型配置 { api_base_url, api_key, model_id }
 * @param {Array} messages - 消息数组 [{ role, content }]
 * @returns {Promise<string>} AI 回复内容
 */
async function chatCompletion(config, messages) {
  const { api_base_url, api_key, model_id } = config;
  const url = new URL(`${api_base_url.replace(/\/+$/, '')}/chat/completions`);

  const body = JSON.stringify({
    model: model_id,
    messages,
    temperature: 0.7,
    max_tokens: 2048
  });

  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 60000
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            return reject(new Error(json.error.message || JSON.stringify(json.error)));
          }
          const content = json.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          reject(new Error(`Parse response failed: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

/**
 * 发送聊天请求（流式 SSE）
 * @param {object} config - 模型配置
 * @param {Array} messages - 消息数组
 * @param {function} onChunk - 收到每个数据块时的回调 (chunk: string) => void
 * @returns {Promise<string>} 完整的 AI 回复内容
 */
async function chatCompletionStream(config, messages, onChunk) {
  const { api_base_url, api_key, model_id } = config;
  const url = new URL(`${api_base_url.replace(/\/+$/, '')}/chat/completions`);

  const body = JSON.stringify({
    model: model_id,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
    stream: true
  });

  return new Promise((resolve, reject) => {
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 120000
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errData = '';
        res.on('data', chunk => errData += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(errData);
            reject(new Error(json.error?.message || `HTTP ${res.statusCode}`));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${errData.substring(0, 200)}`));
          }
        });
        return;
      }

      let fullContent = '';
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 保留不完整的行

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              onChunk(delta);
            }
          } catch {
            // 忽略解析错误的行
          }
        }
      });

      res.on('end', () => {
        // 处理 buffer 中剩余数据
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith('data: ') && trimmed.slice(6) !== '[DONE]') {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                onChunk(delta);
              }
            } catch {}
          }
        }
        resolve(fullContent);
      });

      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(body);
    req.end();
  });
}

module.exports = { chatCompletion, chatCompletionStream };
