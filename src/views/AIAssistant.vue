<template>
  <div class="ai-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <div class="header-actions">
        <el-select
          v-model="currentModelId"
          placeholder="Select Model"
          size="small"
          class="model-select"
          @change="handleModelChange"
        >
          <el-option
            v-for="c in configs"
            :key="c.id"
            :label="c.model_name"
            :value="c.id"
          >
            <span>{{ c.model_name }}</span>
            <el-tag v-if="c.is_default" size="mini" type="success" style="margin-left:8px">Default</el-tag>
          </el-option>
        </el-select>
        <el-button size="small" circle @click="showSettings = true" class="settings-btn">
          <i class="bi bi-gear-fill"></i>
        </el-button>
      </div>
      <div class="title-area">
        <h2 class="gradient-text">AI Assistant</h2>
        <p class="title-desc">Intelligent operations and analysis powered by AI</p>
      </div>
      <div class="header-divider"></div>
    </div>

    <!-- 主体区域 -->
    <div class="chat-container">
      <!-- 左侧对话列表 -->
      <div class="session-sidebar">
        <div class="sidebar-header">
          <el-button type="primary" size="small" class="new-chat-btn" @click="createNewSession">
            <i class="bi bi-plus-lg"></i> New Chat
          </el-button>
        </div>
        <div class="session-list">
          <div
            v-for="s in sessions"
            :key="s.id"
            class="session-item"
            :class="{ active: currentSessionId === s.id }"
            @click="switchSession(s)"
          >
            <i class="bi bi-chat-dots"></i>
            <span class="session-title">{{ s.title }}</span>
            <i class="bi bi-trash delete-btn" @click.stop="handleDeleteSession(s)"></i>
          </div>
          <el-empty v-if="sessions.length === 0" description="No conversations" :image-size="60"></el-empty>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-main">
        <!-- 消息列表 -->
        <div class="messages-area" ref="messagesArea">
          <div v-if="messages.length === 0 && !loading" class="welcome-area">
            <div class="welcome-icon">
              <i class="bi bi-robot"></i>
            </div>
            <h3>SHM AI Assistant</h3>
            <p>Ask me anything about server management, troubleshooting, or scripting.</p>
            <div class="quick-actions">
              <el-button size="small" @click="sendQuick('Help me check the disk usage of a Linux server')">Disk Usage Check</el-button>
              <el-button size="small" @click="sendQuick('Write a shell script to monitor CPU and memory usage')">Monitor Script</el-button>
              <el-button size="small" @click="sendQuick('How to troubleshoot a server that is not responding?')">Troubleshoot Server</el-button>
            </div>
          </div>

          <div v-for="(msg, idx) in messages" :key="idx" class="message-row" :class="msg.role">
            <div class="message-avatar">
              <i :class="msg.role === 'user' ? 'bi bi-person-fill' : 'bi bi-robot'"></i>
            </div>
            <div class="message-body">
              <div class="message-content" v-html="renderMarkdown(msg.content)"></div>
            </div>
          </div>

          <!-- AI 正在回复 -->
          <div v-if="loading" class="message-row assistant">
            <div class="message-avatar">
              <i class="bi bi-robot"></i>
            </div>
            <div class="message-body">
              <div class="message-content typing">
                <span v-html="renderMarkdown(streamingContent)"></span>
                <span class="cursor"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <el-input
              v-model="inputText"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 6 }"
              placeholder="Type your message... (Shift+Enter for new line)"
              @keydown="handleKeydown"
              :disabled="loading"
              ref="inputRef"
            ></el-input>
            <el-button
              type="primary"
              :disabled="!inputText.trim() || loading"
              @click="sendMessage"
              class="send-btn"
            >
              <i class="bi bi-send-fill"></i>
            </el-button>
          </div>
          <div class="input-hint">
            <span v-if="currentModel">Model: {{ currentModel.model_name }}</span>
            <span v-else class="warning">Please configure API key in settings first</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <el-dialog title="AI Model Settings" v-model="showSettings" width="680px" :close-on-click-modal="false">
      <div class="settings-content">
        <div class="settings-header">
          <el-button type="primary" size="small" @click="showAddConfig = true">
            <i class="bi bi-plus-lg"></i> Add Model
          </el-button>
        </div>

        <el-table :data="configs" stripe size="small">
          <el-table-column prop="model_name" label="Model" width="120"></el-table-column>
          <el-table-column prop="model_id" label="Model ID" width="150"></el-table-column>
          <el-table-column prop="api_base_url" label="API URL" show-overflow-tooltip></el-table-column>
          <el-table-column label="API Key" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="mini">
                {{ row.status === 1 ? 'Active' : 'Disabled' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Default" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.is_default" :active-value="1" :inactive-value="0" @change="setDefault(row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="140" align="center">
            <template #default="{ row }">
              <el-button size="mini" @click="editConfig(row)">Edit</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteConfig(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加/编辑模型弹窗 -->
    <el-dialog
      :title="editingConfig ? 'Edit Model' : 'Add Model'"
      v-model="showAddConfig"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetConfigForm"
    >
      <el-form :model="configForm" label-width="100px">
        <el-form-item label="Model Name" required>
          <el-input v-model="configForm.model_name" placeholder="e.g. DeepSeek"></el-input>
        </el-form-item>
        <el-form-item label="API URL" required>
          <el-input v-model="configForm.api_base_url" placeholder="e.g. https://api.deepseek.com"></el-input>
        </el-form-item>
        <el-form-item label="Model ID" required>
          <el-input v-model="configForm.model_id" placeholder="e.g. deepseek-chat"></el-input>
        </el-form-item>
        <el-form-item label="API Key" :required="!editingConfig">
          <el-input v-model="configForm.api_key" type="password" show-password placeholder="Enter API Key"></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <div class="preset-buttons">
          <span class="preset-label">Quick Fill:</span>
          <el-button size="mini" @click="fillPreset('deepseek')">DeepSeek</el-button>
          <el-button size="mini" @click="fillPreset('qwen')">通义千问</el-button>
          <el-button size="mini" @click="fillPreset('glm')">智谱GLM</el-button>
          <el-button size="mini" @click="fillPreset('openai')">OpenAI</el-button>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showAddConfig = false">Cancel</el-button>
        <el-button type="primary" @click="handleSaveConfig" :loading="savingConfig">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { marked } from 'marked'
import {
  getAIConfigs, addAIConfig, updateAIConfig, deleteAIConfig,
  getSessions, createSession, deleteSession,
  getMessages, sendChatMessage
} from '@/api/ai'

export default {
  name: 'AIAssistant',
  data() {
    return {
      // 配置相关
      configs: [],
      showSettings: false,
      showAddConfig: false,
      editingConfig: null,
      savingConfig: false,
      configForm: {
        model_name: '',
        api_base_url: '',
        model_id: '',
        api_key: ''
      },
      currentModelId: null,

      // 会话相关
      sessions: [],
      currentSessionId: null,

      // 消息相关
      messages: [],
      inputText: '',
      loading: false,
      streamingContent: ''
    }
  },
  computed: {
    currentModel() {
      return this.configs.find(c => c.id === this.currentModelId)
    }
  },
  mounted() {
    this.loadConfigs()
    this.loadSessions()
  },
  methods: {
    // ==================== Markdown 渲染 ====================
    renderMarkdown(text) {
      if (!text) return ''
      try {
        return marked(text, { breaks: true, gfm: true })
      } catch {
        return text
      }
    },

    // ==================== 配置管理 ====================
    async loadConfigs() {
      const res = await getAIConfigs()
      if (res.statusCode === '200') {
        this.configs = res.data
        if (!this.currentModelId) {
          const defaultOne = this.configs.find(c => c.is_default)
          const firstOne = this.configs[0]
          this.currentModelId = defaultOne?.id || firstOne?.id || null
        }
      }
    },
    handleModelChange(val) {
      this.currentModelId = val
    },
    editConfig(row) {
      this.editingConfig = row
      this.configForm = {
        model_name: row.model_name,
        api_base_url: row.api_base_url,
        model_id: row.model_id,
        api_key: ''
      }
      this.showAddConfig = true
    },
    resetConfigForm() {
      this.editingConfig = null
      this.configForm = { model_name: '', api_base_url: '', model_id: '', api_key: '' }
    },
    fillPreset(type) {
      const presets = {
        deepseek: { model_name: 'DeepSeek', api_base_url: 'https://api.deepseek.com', model_id: 'deepseek-chat' },
        qwen: { model_name: '通义千问', api_base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model_id: 'qwen-turbo' },
        glm: { model_name: '智谱GLM', api_base_url: 'https://open.bigmodel.cn/api/paas/v4', model_id: 'glm-4-flash' },
        openai: { model_name: 'OpenAI', api_base_url: 'https://api.openai.com/v1', model_id: 'gpt-3.5-turbo' }
      }
      Object.assign(this.configForm, presets[type])
    },
    async handleSaveConfig() {
      const { model_name, api_base_url, model_id, api_key } = this.configForm
      if (!model_name || !api_base_url || !model_id) {
        this.$message.warning('Please fill in all required fields')
        return
      }
      if (!this.editingConfig && !api_key) {
        this.$message.warning('API Key is required')
        return
      }

      this.savingConfig = true
      try {
        if (this.editingConfig) {
          const data = { model_name, api_base_url, model_id }
          if (api_key) data.api_key = api_key
          await updateAIConfig(this.editingConfig.id, data)
          this.$message.success('Updated')
        } else {
          await addAIConfig(this.configForm)
          this.$message.success('Added')
        }
        this.showAddConfig = false
        this.loadConfigs()
      } catch (e) {
        this.$message.error('Save failed')
      } finally {
        this.savingConfig = false
      }
    },
    async handleDeleteConfig(row) {
      try {
        await this.$confirm('Delete this model configuration?', 'Confirm')
        await deleteAIConfig(row.id)
        this.$message.success('Deleted')
        this.loadConfigs()
      } catch { /* cancelled */ }
    },
    async setDefault(row) {
      try {
        await updateAIConfig(row.id, { is_default: row.is_default })
        this.loadConfigs()
      } catch { /* ignore */ }
    },

    // ==================== 会话管理 ====================
    async loadSessions() {
      const res = await getSessions()
      if (res.statusCode === '200') {
        this.sessions = res.data
      }
    },
    async createNewSession() {
      const res = await createSession({
        title: 'New Chat',
        model_config_id: this.currentModelId
      })
      if (res.statusCode === '200') {
        await this.loadSessions()
        this.currentSessionId = res.data.id
        this.messages = []
      }
    },
    async switchSession(session) {
      this.currentSessionId = session.id
      this.currentModelId = session.model_config_id || this.currentModelId
      await this.loadMessages()
    },
    async handleDeleteSession(session) {
      try {
        await this.$confirm('Delete this conversation?', 'Confirm')
        await deleteSession(session.id)
        if (this.currentSessionId === session.id) {
          this.currentSessionId = null
          this.messages = []
        }
        this.loadSessions()
      } catch { /* cancelled */ }
    },

    // ==================== 消息管理 ====================
    async loadMessages() {
      if (!this.currentSessionId) return
      const res = await getMessages(this.currentSessionId)
      if (res.statusCode === '200') {
        this.messages = res.data
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    handleKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },
    sendQuick(text) {
      this.inputText = text
      this.sendMessage()
    },
    async sendMessage() {
      const content = this.inputText.trim()
      if (!content || this.loading) return

      if (!this.currentModelId) {
        this.$message.warning('Please configure an AI model first')
        this.showSettings = true
        return
      }

      if (!this.currentSessionId) {
        const res = await createSession({
          title: 'New Chat',
          model_config_id: this.currentModelId
        })
        if (res.statusCode === '200') {
          this.currentSessionId = res.data.id
          await this.loadSessions()
        } else {
          this.$message.error('Failed to create session')
          return
        }
      }

      this.messages.push({ role: 'user', content })
      this.inputText = ''
      this.loading = true
      this.streamingContent = ''

      this.$nextTick(() => this.scrollToBottom())

      sendChatMessage(
        this.currentSessionId,
        content,
        this.currentModelId,
        (chunk) => {
          this.streamingContent += chunk
          this.$nextTick(() => this.scrollToBottom())
        },
        (error) => {
          this.loading = false
          this.streamingContent = ''
          this.$message.error('AI Error: ' + error)
        },
        () => {
          if (this.streamingContent) {
            this.messages.push({ role: 'assistant', content: this.streamingContent })
          }
          this.streamingContent = ''
          this.loading = false
          this.$nextTick(() => this.scrollToBottom())
          this.loadSessions()
        }
      )
    },
    scrollToBottom() {
      const area = this.$refs.messagesArea
      if (area) {
        area.scrollTop = area.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.ai-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  min-height: 500px;
}

.page-header {
  padding: 0 0 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title-area {
  text-align: center;
  padding: 16px 0 20px;
}
.gradient-text {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #00c6ff 0%, #7c3aed 50%, #ec4899 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 6s ease infinite;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.title-desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: #909399;
  letter-spacing: 0.5px;
}
.header-divider {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00c6ff40, #7c3aed40, #ec489940, transparent);
  border-radius: 1px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: flex-end;
}
.model-select {
  width: 200px;
}
.model-select :deep(.el-input__inner) {
  border-radius: 8px;
  border-color: #dcdfe6;
}
.model-select :deep(.el-input__inner:focus) {
  border-color: #7c3aed;
}
.settings-btn {
  background: #f4f4f5;
  border: none;
  color: #606266;
  transition: all 0.3s;
}
.settings-btn:hover {
  background: linear-gradient(135deg, #00c6ff, #7c3aed);
  color: #fff;
  transform: rotate(90deg);
}

.chat-container {
  display: flex;
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.session-sidebar {
  width: 240px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}
.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}
.new-chat-btn {
  width: 100%;
}
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.session-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
  gap: 8px;
}
.session-item:hover {
  background: #ecf5ff;
}
.session-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.session-item i:first-child {
  font-size: 14px;
  flex-shrink: 0;
}
.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}
.delete-btn {
  opacity: 0;
  font-size: 12px;
  color: #f56c6c;
  transition: opacity 0.2s;
}
.session-item:hover .delete-btn {
  opacity: 1;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.welcome-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
.welcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c6ff20, #7c3aed20);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.welcome-icon i {
  font-size: 36px;
  background: linear-gradient(135deg, #00c6ff, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.welcome-area h3 {
  margin: 0 0 8px;
  color: #303133;
}
.welcome-area p {
  margin: 0 0 24px;
}
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.message-row.user {
  flex-direction: row-reverse;
}
.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}
.message-row.assistant .message-avatar {
  background: linear-gradient(135deg, #00c6ff20, #7c3aed20);
  color: #7c3aed;
}
.message-row.user .message-avatar {
  background: #ecf5ff;
  color: #409eff;
}
.message-body {
  max-width: 75%;
  min-width: 60px;
}
.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.message-row.assistant .message-content {
  background: #f4f4f5;
  color: #303133;
  border-top-left-radius: 4px;
}
.message-row.user .message-content {
  background: #409eff;
  color: #fff;
  border-top-right-radius: 4px;
}

.message-content :deep(p) {
  margin: 0 0 8px;
}
.message-content :deep(p:last-child) {
  margin-bottom: 0;
}
.message-content :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
}
.message-content :deep(code) {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}
.message-row.user .message-content :deep(code) {
  background: rgba(255,255,255,0.2);
}
.message-content :deep(pre code) {
  background: none;
  padding: 0;
}
.message-content :deep(ul), .message-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}
.message-content :deep(blockquote) {
  border-left: 3px solid #dcdfe6;
  padding-left: 12px;
  margin: 8px 0;
  color: #909399;
}
.message-content :deep(table) {
  border-collapse: collapse;
  margin: 8px 0;
}
.message-content :deep(th), .message-content :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 6px 10px;
  font-size: 13px;
}
.message-content :deep(th) {
  background: #f5f7fa;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: #7c3aed;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.input-area {
  padding: 12px 20px 16px;
  border-top: 1px solid #ebeef5;
}
.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.input-wrapper .el-textarea {
  flex: 1;
}
.input-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
  resize: none;
  padding: 10px 14px;
}
.send-btn {
  height: 40px;
  width: 40px;
  padding: 0;
  border-radius: 8px;
}
.input-hint {
  margin-top: 6px;
  font-size: 11px;
  color: #909399;
}
.input-hint .warning {
  color: #e6a23c;
}

.settings-header {
  margin-bottom: 12px;
}
.preset-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.preset-label {
  font-size: 13px;
  color: #606266;
}
</style>
