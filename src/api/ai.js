import axios from '../plugins/axios'

// ==================== 模型配置 ====================

// 获取所有模型配置
export function getAIConfigs() {
  return axios.get('/ai/configs')
}

// 新增模型配置
export function addAIConfig(data) {
  return axios.post('/ai/configs', data)
}

// 更新模型配置
export function updateAIConfig(id, data) {
  return axios.put(`/ai/configs/${id}`, data)
}

// 删除模型配置
export function deleteAIConfig(id) {
  return axios.delete(`/ai/configs/${id}`)
}

// ==================== 对话会话 ====================

// 获取对话列表
export function getSessions() {
  return axios.get('/ai/sessions')
}

// 新建对话
export function createSession(data) {
  return axios.post('/ai/sessions', data)
}

// 删除对话
export function deleteSession(id) {
  return axios.delete(`/ai/sessions/${id}`)
}

// ==================== 消息 ====================

// 获取对话消息
export function getMessages(sessionId) {
  return axios.get(`/ai/sessions/${sessionId}/messages`)
}

// 发送消息（SSE 流式）- 使用 fetch 因为 axios 不支持 SSE
export function sendChatMessage(sessionId, content, modelConfigId, onChunk, onError, onDone) {
  const token = localStorage.getItem('token')

  fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      content,
      model_config_id: modelConfigId
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    function read() {
      reader.read().then(({ done, value }) => {
        if (done) {
          onDone()
          return
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)

          if (data === '[DONE]') {
            onDone()
            return
          }

          try {
            const json = JSON.parse(data)
            if (json.error) {
              onError(json.error)
              return
            }
            if (json.chunk) {
              onChunk(json.chunk)
            }
          } catch {
            // ignore parse errors
          }
        }

        read()
      }).catch(err => {
        onError(err.message)
      })
    }

    read()
  }).catch(err => {
    onError(err.message)
  })
}
