<template>
  <el-row>
    <el-col :span="22" :offset="1">
      <h4>Automatic Preventive Maintenance and Generate Report Automatically</h4>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Automatic PM" name="1">
          <el-descriptions class="margin-top" :column="3" :size="'medium'" border>
            <template #extra>
              <el-button size="small" @click="showScript">
                <i class="bi bi-file-earmark-code"></i> Inspection Script
              </el-button>
              <el-button type="primary" size="small" @click="generateReport" :loading="generating">
                <i class="bi bi-file-earmark-text"></i> Generate Report
              </el-button>
            </template>
            <el-descriptions-item>
              <template #label><i class="bi bi-pc-display"></i>&nbsp;Host Type</template>
              {{ host.HostType }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="el-icon-user"></i>&nbsp;Host Name</template>
              {{ host.HostName }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="el-icon-location-outline"></i>&nbsp;IP Address</template>
              {{ host.IPadd }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-info-circle"></i>&nbsp;Status</template>
              <el-tag :type="statusType" size="small">{{ host.StatusInfo }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-tag"></i>&nbsp;Category</template>
              {{ host.Category || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>

        <el-collapse-item title="Reports List" name="2">
          <el-table :data="tableData" style="width: 100%" v-loading="loadingList" empty-text="No reports yet">
            <el-table-column label="Date" prop="date" width="200"></el-table-column>
            <el-table-column label="Name" prop="name"></el-table-column>
            <el-table-column align="right" width="130">
              <template #default="scope">
                <div style="display: flex; gap: 4px; justify-content: flex-end; flex-wrap: nowrap;">
                  <el-tooltip content="View" placement="top">
                    <el-button size="mini" class="icon-btn" @click="reportView(scope.row)">
                      <i class="bi bi-eye"></i>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="Download" placement="top">
                    <el-button size="mini" type="primary" class="icon-btn" @click="reportDownload(scope.row)">
                      <i class="bi bi-download"></i>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="Delete" placement="top">
                    <el-button size="mini" type="danger" class="icon-btn" @click="reportDelete(scope.row)">
                      <i class="bi bi-trash"></i>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-col>

    <!-- 巡检脚本弹窗 -->
    <el-dialog v-model="scriptDialogVisible" width="750px" :show-close="true">
      <template #title>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 16px; font-weight: 600;">{{ scriptName }}</span>
          <el-tag size="small" type="info">{{ host.HostType }}</el-tag>
        </div>
      </template>
      <div class="code-block">
        <div class="code-header">
          <span class="code-dot red"></span>
          <span class="code-dot yellow"></span>
          <span class="code-dot green"></span>
          <span class="code-title">{{ scriptName }}</span>
          <div style="margin-left: auto; display: flex; gap: 6px;">
            <el-button size="mini" style="padding: 2px 8px;" @click="downloadScript">
              <i class="bi bi-download"></i> Download
            </el-button>
            <el-button size="mini" style="padding: 2px 8px;" @click="editScript">
              <i class="bi bi-pencil"></i> Edit
            </el-button>
          </div>
        </div>
        <pre v-if="!scriptEditing" class="code-content" v-html="highlightedScript"></pre>
        <textarea v-else class="code-editor" v-model="scriptContent"></textarea>
      </div>
      <template #footer v-if="scriptEditing">
        <el-button size="small" @click="scriptEditing = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="saveScript">Save</el-button>
      </template>
    </el-dialog>
  </el-row>
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: "HostAutoPM",
  props: {
    host: { type: Object, default: () => ({}) }
  },
  computed: {
    statusType() {
      const status = this.host.StatusInfo;
      if (status === 'Severe') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'success';
    },
    highlightedScript() {
      return this.highlightShell(this.scriptContent);
    }
  },
  data() {
    return {
      activeNames: ['1', '2'],
      tableData: [],
      loadingList: false,
      generating: false,
      scriptDialogVisible: false,
      scriptEditing: false,
      scriptName: 'Linux_RHEL8.sh',
      scriptContent: ''
    }
  },
  mounted() {
    if (this.host.HostId) this.loadReports();
  },
  watch: {
    'host.HostId'(val) {
      if (val) this.loadReports();
    }
  },
  methods: {
    async loadReports() {
      if (!this.host.HostId) return;
      this.loadingList = true;
      try {
        const res = await axios.get(`/reports/list/${this.host.HostId}`);
        if (res) {
          this.tableData = res || [];
        }
      } catch (e) {
        console.error('Load reports failed:', e);
      }
      this.loadingList = false;
    },
    highlightShell(code) {
      if (!code) return '';
      let html = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      // 注释（行内 # 开头，但不在引号内）
      html = html.replace(/(#.*)$/gm, '<span class="hl-comment">$1</span>');
      // 字符串（双引号和单引号）
      html = html.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="hl-string">"$1"</span>');
      html = html.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="hl-string">\'$1\'</span>');
      // 变量 $VAR ${VAR}
      html = html.replace(/(\$\{[^}]+\})/g, '<span class="hl-var">$1</span>');
      html = html.replace(/(\$[A-Za-z_][A-Za-z_0-9]*)/g, '<span class="hl-var">$1</span>');
      // 关键字
      const keywords = ['echo', 'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'exit', 'cat', 'grep', 'awk', 'sed', 'cut', 'tr', 'head', 'tail', 'df', 'free', 'ps', 'uname', 'hostname', 'uptime', 'nproc', 'top', 'systemctl', 'journalctl', 'getenforce', 'last', 'chmod', 'mkdir', 'echo'];
      const kwRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
      html = html.replace(kwRegex, (match, p1, offset, str) => {
        // 避免替换已标记内容里的关键字
        const before = str.substring(Math.max(0, offset - 30), offset);
        if (before.includes('class="hl-')) return match;
        return '<span class="hl-keyword">' + p1 + '</span>';
      });
      // 管道和重定向
      html = html.replace(/(\||&gt;|&lt;|&amp;&amp;|\|\|)/g, '<span class="hl-pipe">$1</span>');
      // shebang
      html = html.replace(/^(#!.*)$/gm, '<span class="hl-shebang">$1</span>');
      return html;
    },

    async showScript() {
      try {
        const res = await axios.get('/reports/script');
        if (res) {
          this.scriptContent = res.script;
          this.scriptName = res.name || 'Linux_RHEL8.sh';
          this.scriptEditing = false;
          this.scriptDialogVisible = true;
        }
      } catch (e) {
        ElMessage.error('Failed to load script');
      }
    },
    editScript() {
      this.scriptEditing = true;
    },
    saveScript() {
      this.scriptEditing = false;
      ElMessage.success('Script updated locally');
    },
    downloadScript() {
      const blob = new Blob([this.scriptContent], { type: 'text/x-shellscript' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.scriptName;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    async generateReport() {
      if (!this.host.HostId) return;
      this.generating = true;
      try {
        const res = await axios.post(`/reports/generate/${this.host.HostId}`);
        if (res) {
          ElMessage.success('Report generated successfully');
          this.loadReports();
        } else {
          ElMessage.error('Generation failed');
        }
      } catch (e) {
        ElMessage.error('Failed to generate report');
      }
      this.generating = false;
    },
    reportView(row) {
      window.open(`/api/reports/view/${this.host.HostId}/${row.name}`, '_blank');
    },
    reportDownload(row) {
      const link = document.createElement('a');
      link.href = `/api/reports/download/${this.host.HostId}/${row.name}`;
      link.download = row.name;
      link.click();
    },
    async reportDelete(row) {
      try {
        await ElMessageBox.confirm(
          `Are you sure to delete report "${row.name}"?`,
          'Confirm Delete',
          { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
        );
      } catch { return; }

      try {
        await axios.delete(`/reports/${this.host.HostId}/${row.name}`);
        ElMessage.success('Report deleted');
        this.loadReports();
      } catch (e) {
        ElMessage.error('Failed to delete report');
      }
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
.code-block {
  border-radius: 10px;
  overflow: hidden;
  background: #1e1e2e;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.code-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #181825;
}
.code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.code-dot.red { background: #f38ba8; }
.code-dot.yellow { background: #f9e2af; }
.code-dot.green { background: #a6e3a1; }
.code-title {
  margin-left: 8px;
  color: #6c7086;
  font-size: 13px;
  font-family: monospace;
}
.code-content {
  margin: 0;
  padding: 16px 16px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #cdd6f4;
  max-height: 500px;
  overflow: auto;
  white-space: pre;
  text-align: left;
  tab-size: 2;
}
.code-content::-webkit-scrollbar {
  width: 6px;
}
.code-content::-webkit-scrollbar-thumb {
  background: #45475a;
  border-radius: 3px;
}
.code-editor {
  width: 100%;
  min-height: 400px;
  margin: 0;
  padding: 16px;
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #cdd6f4;
  background: #1e1e2e;
  border: none;
  outline: none;
  resize: vertical;
  tab-size: 2;
}
</style>

<style>
/* 语法高亮（非 scoped 才能穿透 v-html） */
.hl-comment  { color: #6c7086; font-style: italic; }
.hl-string   { color: #a6e3a1; }
.hl-var      { color: #f9e2af; }
.hl-keyword  { color: #89b4fa; font-weight: 600; }
.hl-pipe     { color: #f38ba8; }
.hl-shebang  { color: #f38ba8; font-weight: 700; }
</style>
