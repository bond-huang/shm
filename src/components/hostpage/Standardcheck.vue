<template>
  <el-row>
    <el-col :span="22" :offset="1">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h4 style="margin: 0;">System Online Standardized Check</h4>
        <el-button type="primary" size="small" @click="openAddDialog">
          <i class="bi bi-plus-lg"></i> Add Script
        </el-button>
      </div>

      <el-table :data="scriptList" style="width: 100%" v-loading="loading" empty-text="No scripts added yet. Click 'Add Script' to get started.">
        <el-table-column label="Name" prop="name" min-width="150">
          <template #default="{ row }">
            <span style="font-weight: 600;">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Readme" min-width="100" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="info" class="icon-btn" @click="viewReadme(row)" :disabled="!row.readme">
              <i class="bi bi-file-earmark-text"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Script" min-width="100" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" class="icon-btn" @click="viewScript(row)">
              <i class="bi bi-code-slash"></i>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Description" prop="description" min-width="200">
          <template #default="{ row }">
            <span v-if="row.description">{{ row.description }}</span>
            <span v-else style="color: #c0c4cc;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" min-width="220" align="center">
          <template #default="{ row }">
            <div style="display: flex; gap: 4px; justify-content: center;">
              <el-tooltip content="Run" placement="top">
                <el-button size="mini" type="success" class="icon-btn" @click="runScript(row)" :loading="row._running">
                  <i class="bi bi-play-fill"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="History" placement="top">
                <el-button size="mini" type="warning" class="icon-btn" @click="viewHistory(row)">
                  <i class="bi bi-clock-history"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Delete" placement="top">
                <el-button size="mini" type="danger" class="icon-btn" @click="deleteScript(row)">
                  <i class="bi bi-trash"></i>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Add Script Dialog -->
      <el-dialog v-model="addDialogVisible" title="Add Script from Library" width="600px" :close-on-click-modal="false">
        <el-form label-width="100px" size="small">
          <el-form-item label="System">
            <el-select v-model="addForm.system" placeholder="Select System" filterable @change="onSystemChange" style="width: 100%;">
              <el-option v-for="s in systems" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="Type">
            <el-select v-model="addForm.type" placeholder="Select Type" filterable @change="onTypeChange" style="width: 100%;">
              <el-option v-for="t in filteredTypes" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="Script">
            <el-select v-model="addForm.scriptId" placeholder="Select Script" filterable style="width: 100%;">
              <el-option v-for="s in filteredScripts" :key="s.id" :label="s.name" :value="s.id">
                <span>{{ s.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 12px;">{{ s.script_type }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="addForm.description" placeholder="Brief description for this check (optional)" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button size="small" @click="addDialogVisible = false">Cancel</el-button>
          <el-button size="small" type="primary" @click="confirmAdd" :loading="addLoading" :disabled="!addForm.scriptId">Add</el-button>
        </template>
      </el-dialog>

      <!-- Readme Dialog -->
      <el-dialog v-model="readmeDialogVisible" :title="readmeTitle" width="650px">
        <div v-if="readmeContent" v-html="renderedReadme" class="markdown-body"></div>
        <el-empty v-else description="No README content available" />
      </el-dialog>

      <!-- Script View Dialog -->
      <el-dialog v-model="scriptDialogVisible" :title="scriptTitle" width="750px">
        <div class="code-block">
          <div class="code-header">
            <span class="code-dot red"></span>
            <span class="code-dot yellow"></span>
            <span class="code-dot green"></span>
            <span class="code-title">{{ scriptTitle }}</span>
          </div>
          <pre class="code-content" style="color: #1e293b;" v-html="highlightedScript"></pre>
        </div>
      </el-dialog>

      <!-- Run Result Dialog -->
      <el-dialog v-model="runResultVisible" :title="'Run Result — ' + runResult.scriptName" width="750px">
        <div style="margin-bottom: 8px;">
          <el-tag :type="runResult.status === 'success' ? 'success' : 'danger'" size="small">{{ runResult.status }}</el-tag>
          <span style="margin-left: 8px; color: #909399; font-size: 12px;">{{ runResult.time }}</span>
        </div>
        <div class="code-block">
          <div class="code-header">
            <span class="code-dot red"></span>
            <span class="code-dot yellow"></span>
            <span class="code-dot green"></span>
            <span class="code-title">Output</span>
          </div>
          <pre class="code-content" style="color: #1e293b;">{{ runResult.output || '(no output)' }}</pre>
        </div>
      </el-dialog>

      <!-- History Dialog -->
      <el-dialog v-model="historyVisible" :title="'Execution History — ' + historyScriptName" width="750px">
        <el-table :data="historyList" style="width: 100%" empty-text="No execution history" size="small">
          <el-table-column label="Time" min-width="160">
            <template #default="{ row }">
              {{ formatTime(row.start_time) }}
            </template>
          </el-table-column>
          <el-table-column label="User" prop="run_user" width="100" />
          <el-table-column label="Status" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : row.status === 'running' ? 'info' : 'danger'" size="mini">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Action" width="80" align="center">
            <template #default="{ row }">
              <el-button size="mini" type="info" class="icon-btn" @click="viewRunOutput(row)">
                <i class="bi bi-eye"></i>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'

export default {
  name: "HostStandardcheck",
  props: {
    host: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      scriptList: [],
      // Add dialog
      addDialogVisible: false,
      addLoading: false,
      systems: [],
      allScripts: [],
      filteredTypes: [],
      filteredScripts: [],
      addForm: {
        system: '',
        type: '',
        scriptId: null,
        description: ''
      },
      // Readme dialog
      readmeDialogVisible: false,
      readmeTitle: '',
      readmeContent: '',
      // Script dialog
      scriptDialogVisible: false,
      scriptTitle: '',
      scriptContent: '',
      // Run result
      runResultVisible: false,
      runResult: { status: '', output: '', scriptName: '', time: '' },
      // History
      historyVisible: false,
      historyScriptName: '',
      historyList: []
    }
  },
  computed: {
    renderedReadme() {
      return this.readmeContent ? marked(this.readmeContent) : '';
    },
    highlightedScript() {
      return this.highlightShell(this.scriptContent);
    }
  },
  mounted() {
    if (this.host.HostId) this.loadScripts();
  },
  watch: {
    'host.HostId'(val) {
      if (val) this.loadScripts();
    }
  },
  methods: {
    async loadScripts() {
      if (!this.host.HostId) return;
      this.loading = true;
      try {
        const res = await axios.get(`/standard-check/${this.host.HostId}`);
        if (res) {
          this.scriptList = (res || []).map(s => ({ ...s, _running: false }));
        }
      } catch (e) {
        console.error('Load scripts failed:', e);
      }
      this.loading = false;
    },

    // === Add Script ===
    async openAddDialog() {
      this.addDialogVisible = true;
      this.addForm = { system: '', type: '', scriptId: null, description: '' };
      this.filteredTypes = [];
      this.filteredScripts = [];

      try {
        const res = await axios.get('/scripts', { params: { pageSize: 1000 } });
        if (res && res.content) {
          this.allScripts = res.content;
          this.systems = [...new Set(res.content.map(s => s.run_system))].sort();
        }
      } catch (e) {
        ElMessage.error('Failed to load scripts');
      }
    },
    onSystemChange() {
      this.addForm.type = '';
      this.addForm.scriptId = null;
      const types = new Set(this.allScripts.filter(s => s.run_system === this.addForm.system).map(s => s.script_type));
      this.filteredTypes = [...types].sort();
      this.filteredScripts = this.allScripts.filter(s => s.run_system === this.addForm.system);
    },
    onTypeChange() {
      this.addForm.scriptId = null;
      this.filteredScripts = this.allScripts.filter(
        s => s.run_system === this.addForm.system && s.script_type === this.addForm.type
      );
    },
    async confirmAdd() {
      this.addLoading = true;
      try {
        await axios.post(`/standard-check/${this.host.HostId}`, {
          script_id: this.addForm.scriptId,
          description: this.addForm.description
        });
        ElMessage.success('Script added');
        this.addDialogVisible = false;
        this.loadScripts();
      } catch (e) {
        ElMessage.error(e.response?.data?.statusMessage || 'Failed to add script');
      }
      this.addLoading = false;
    },

    // === View Readme ===
    viewReadme(row) {
      this.readmeTitle = `${row.name} — README`;
      this.readmeContent = row.readme || '';
      this.readmeDialogVisible = true;
    },

    // === View Script ===
    viewScript(row) {
      this.scriptTitle = row.name;
      this.scriptContent = row.script_content || '';
      this.scriptDialogVisible = true;
    },

    // === Run Script ===
    async runScript(row) {
      try {
        await ElMessageBox.confirm(
          `Run script "${row.name}" on ${this.host.HostName}?`,
          'Confirm Run',
          { confirmButtonText: 'Run', cancelButtonText: 'Cancel', type: 'info' }
        );
      } catch { return; }

      row._running = true;
      try {
        const res = await axios.post(`/standard-check/${this.host.HostId}/${row.script_id}/run`);
        if (res) {
          this.runResult = {
            status: res.status,
            output: res.output,
            scriptName: res.scriptName,
            time: this.formatTime(res.start_time || new Date())
          };
          this.runResultVisible = true;
          ElMessage.success(`Script executed — ${res.status}`);
        }
      } catch (e) {
        ElMessage.error(e.response?.data?.statusMessage || 'Run failed');
      }
      row._running = false;
    },

    // === History ===
    async viewHistory(row) {
      this.historyScriptName = row.name;
      this.historyVisible = true;
      try {
        const res = await axios.get(`/standard-check/${this.host.HostId}/${row.script_id}/history`);
        this.historyList = res || [];
      } catch (e) {
        this.historyList = [];
      }
    },
    viewRunOutput(row) {
      this.runResult = {
        status: row.status,
        output: row.output,
        scriptName: this.historyScriptName,
        time: this.formatTime(row.start_time)
      };
      this.runResultVisible = true;
    },

    // === Delete ===
    async deleteScript(row) {
      try {
        await ElMessageBox.confirm(
          `Remove script "${row.name}" from this host?`,
          'Confirm Delete',
          { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
        );
      } catch { return; }

      try {
        await axios.delete(`/standard-check/${this.host.HostId}/${row.script_id}`);
        ElMessage.success('Script removed');
        this.loadScripts();
      } catch (e) {
        ElMessage.error('Failed to remove script');
      }
    },

    // === Utils ===
    formatTime(t) {
      if (!t) return '-';
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    },
    highlightShell(code) {
      if (!code) return '';
      let html = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html = html.replace(/(#.*)$/gm, '<span style="color:#6c7086;font-style:italic;">$1</span>');
      html = html.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span style="color:#a6e3a1;">"$1"</span>');
      html = html.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span style="color:#a6e3a1;">\'$1\'</span>');
      html = html.replace(/(\$\{[^}]+\})/g, '<span style="color:#f9e2af;">$1</span>');
      html = html.replace(/(\$[A-Za-z_][A-Za-z_0-9]*)/g, '<span style="color:#f9e2af;">$1</span>');
      const kw = ['echo','if','then','else','fi','for','do','done','while','case','esac','function','return','exit','cat','grep','awk','sed','cut','tr','head','tail','df','free','ps','uname','hostname','uptime','nproc','top','systemctl','journalctl','getenforce','last','chmod','mkdir'];
      html = html.replace(new RegExp('\\b(' + kw.join('|') + ')\\b', 'g'), '<span style="color:#89b4fa;font-weight:600;">$1</span>');
      html = html.replace(/(\||&gt;|&lt;|&amp;&amp;|\|\|)/g, '<span style="color:#f38ba8;">$1</span>');
      html = html.replace(/^(#!.*)$/gm, '<span style="color:#f38ba8;font-weight:700;">$1</span>');
      return html;
    }
  }
}
</script>

<style scoped>
.icon-btn {
  padding: 4px 6px !important;
  min-width: 28px !important;
  max-width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}
</style>

<style>
/* 非 scoped，确保 el-dialog 中的样式生效 */
.standard-check .code-block,
.code-block {
  border-radius: 10px;
  overflow: hidden;
  background: #1a1b26;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.standard-check .code-header,
.code-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #13141c;
}
.code-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.code-dot.red { background: #f38ba8; }
.code-dot.yellow { background: #f9e2af; }
.code-dot.green { background: #a6e3a1; }
.standard-check .code-title,
.code-title { margin-left: 8px; color: #a9b1d6; font-size: 13px; font-family: monospace; }
.standard-check .code-content,
.code-content {
  margin: 0; padding: 16px; font-family: 'Cascadia Code','Fira Code','Consolas',monospace;
  font-size: 13px; line-height: 1.7; color: #1e293b; max-height: 500px; overflow: auto;
  white-space: pre; text-align: left; tab-size: 2;
}
.code-content::-webkit-scrollbar { width: 6px; }
.code-content::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
.markdown-body { font-size: 14px; line-height: 1.8; color: #333; }
.markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #1a73e8; }
.markdown-body code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
.markdown-body pre { background: #f1f3f4; padding: 12px; border-radius: 6px; overflow-x: auto; }
</style>
