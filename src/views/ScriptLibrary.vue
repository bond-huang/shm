<template>
  <div>
    <div class="page-title">
      <div class="title-glow"></div>
      <h2 class="gradient-text">Script Library</h2>
      <p class="title-desc">Manage and organize your operational scripts</p>
    </div>

    <!-- 筛选栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
      <el-input v-model="search" placeholder="Search by name or description" size="small" clearable
        style="width: 260px;" @clear="loadData" @keyup.enter="loadData">
        <template #prefix><i class="bi bi-search"></i></template>
      </el-input>
      <el-select v-model="filterSystem" placeholder="System" size="small" clearable style="width: 140px;" @change="loadData">
        <el-option v-for="s in systemOptions" :key="s" :label="s" :value="s" />
      </el-select>
      <el-select v-model="filterType" placeholder="Type" size="small" clearable style="width: 160px;" @change="loadData">
        <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
      </el-select>
      <el-button size="small" @click="loadData"><i class="bi bi-arrow-clockwise"></i> Refresh</el-button>
      <div style="flex: 1;"></div>
      <el-button size="small" type="success" @click="openAddDialog"><i class="bi bi-plus-lg"></i> Add Script</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="tableData" style="width: 100%" v-loading="loading" empty-text="No scripts found"
      :header-cell-style="{ background: '#f8fafc', color: '#334155', fontWeight: '600' }">
      <el-table-column prop="name" label="Name" width="180"></el-table-column>
      <el-table-column prop="introduction" label="Introduction" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="run_system" label="System" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="systemTagType(row.run_system)">{{ row.run_system }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="script_type" label="Type" width="140"></el-table-column>
      <el-table-column prop="filename" label="File" width="160" show-overflow-tooltip></el-table-column>
      <el-table-column label="Updated" width="160">
        <template #default="{ row }">{{ formatTime(row.updated_at) }}</template>
      </el-table-column>
      <el-table-column align="right" width="160">
        <template #default="scope">
          <div style="display: flex; gap: 4px; justify-content: flex-end; flex-wrap: nowrap;">
            <el-tooltip content="View" placement="top">
              <el-button size="mini" class="icon-btn" @click="viewScript(scope.row)">
                <i class="bi bi-eye"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Edit" placement="top">
              <el-button size="mini" type="primary" class="icon-btn" @click="openEditDialog(scope.row)">
                <i class="bi bi-pencil"></i>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button size="mini" type="danger" class="icon-btn" @click="deleteScript(scope.row)">
                <i class="bi bi-trash"></i>
              </el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <basic-pagination :total="pageTotal" @pageChange="pageChange"></basic-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Script' : 'Add Script'" width="650px" :close-on-click-modal="false">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px" size="small">
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Unique script name" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Introduction">
          <el-input v-model="form.introduction" placeholder="Brief description (max 30 chars)" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="System" prop="run_system">
          <el-select v-model="form.run_system" filterable allow-create placeholder="e.g. AIX, RHEL, Windows" style="width: 100%;">
            <el-option label="AIX" value="AIX" />
            <el-option label="RHEL" value="RHEL" />
            <el-option label="CentOS" value="CentOS" />
            <el-option label="Ubuntu" value="Ubuntu" />
            <el-option label="Windows" value="Windows" />
            <el-option label="MySQL" value="MySQL" />
            <el-option label="Redis" value="Redis" />
            <el-option label="Oracle" value="Oracle" />
            <el-option label="DB2" value="DB2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Type" prop="script_type">
          <el-select v-model="form.script_type" filterable allow-create placeholder="e.g. System Script, MySQL Script" style="width: 100%;">
            <el-option label="System Script" value="System Script" />
            <el-option label="Database Script" value="Database Script" />
            <el-option label="Network Script" value="Network Script" />
            <el-option label="Monitoring Script" value="Monitoring Script" />
            <el-option label="Backup Script" value="Backup Script" />
            <el-option label="Security Script" value="Security Script" />
            <el-option label="Maintenance Script" value="Maintenance Script" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description">
          <div style="width: 100%;">
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <el-button size="mini" @click="$refs.mdInput.click()">
                <i class="bi bi-upload"></i> Upload .md
              </el-button>
              <span v-if="mdFileName" style="font-size: 12px; color: #606266; line-height: 28px;">
                {{ mdFileName }}
                <el-button size="mini" type="text" @click="mdFileName = ''"><i class="bi bi-x-lg"></i></el-button>
              </span>
            </div>
            <input ref="mdInput" type="file" style="display: none;" accept=".md,.txt" @change="onMdFileSelected" />
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="Supports Markdown format" />
          </div>
        </el-form-item>
        <el-form-item label="Script File">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-button size="small" type="primary" @click="$refs.fileInput.click()">
              <i class="bi bi-upload"></i> Choose File
            </el-button>
            <span v-if="uploadFile" style="font-size: 13px; color: #606266;">
              {{ uploadFile.name }}
              <el-button size="mini" type="text" @click="uploadFile = null" style="margin-left: 4px;">
                <i class="bi bi-x-lg"></i>
              </el-button>
            </span>
            <span v-else style="font-size: 12px; color: #909399;">.sh .py .sql .bat .ps1 .yml .conf .txt (max 5MB)</span>
          </div>
          <input ref="fileInput" type="file" style="display: none;" accept=".sh,.bash,.py,.pl,.sql,.bat,.ps1,.yml,.yaml,.conf,.txt" @change="onFileSelected" />
        </el-form-item>
        <el-divider content-position="left">Or paste script content</el-divider>
        <el-form-item label="Content">
          <el-input v-model="form.script_content" type="textarea" :rows="8" placeholder="#!/bin/bash ..." class="script-textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="dialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="submitForm" :loading="submitting">{{ isEdit ? 'Update' : 'Add' }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看脚本弹窗 -->
    <el-dialog v-model="viewDialogVisible" width="700px">
      <template #title>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 600;">{{ viewData.name }}</span>
          <el-tag size="small" :type="systemTagType(viewData.run_system)">{{ viewData.run_system }}</el-tag>
          <el-tag size="small" type="info">{{ viewData.script_type }}</el-tag>
        </div>
      </template>
      <div v-if="viewData.description_file" style="margin-bottom: 8px; font-size: 12px; color: #909399;">
        <i class="bi bi-file-earmark-text"></i> {{ viewData.description_file }}
      </div>
      <div v-if="viewData.description" class="markdown-body" v-html="renderMarkdown(viewData.description)"></div>
      <div class="code-block">
        <div class="code-header">
          <span class="code-dot red"></span>
          <span class="code-dot yellow"></span>
          <span class="code-dot green"></span>
          <span class="code-title">{{ viewData.filename || viewData.name }}</span>
        </div>
        <pre class="code-content" v-html="highlightScript(viewData.script_content, viewData.filename)"></pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { marked } from 'marked'
import BasicPagination from "@/components/pagination/BasicPagination"
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: "ScriptLibrary",
  components: { BasicPagination },
  data() {
    return {
      tableData: [],
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      pageTotal: 0,
      search: '',
      filterSystem: '',
      filterType: '',
      systemOptions: [],
      typeOptions: [],
      // 表单
      dialogVisible: false,
      isEdit: false,
      submitting: false,
      editId: null,
      form: {
        name: '', run_system: '', script_type: '', description: '', script_content: '', filename: ''
      },
      formRules: {
        name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
        run_system: [{ required: true, message: 'System is required', trigger: 'change' }],
        script_type: [{ required: true, message: 'Type is required', trigger: 'change' }]
      },
      uploadFile: null,
      mdFileName: '',
      // 查看
      viewDialogVisible: false,
      viewData: {}
    }
  },
  mounted() {
    this.loadData();
    this.loadFilterOptions();
  },
  methods: {
    pageChange(item) {
      this.pageIndex = item.pageIndex;
      this.pageSize = item.pageLimit;
      this.loadData();
    },
    async loadData() {
      this.loading = true;
      try {
        const res = await axios.get('/scripts', {
          params: {
            page: this.pageIndex,
            pageSize: this.pageSize,
            search: this.search,
            runSystem: this.filterSystem,
            scriptType: this.filterType
          }
        });
        if (res) {
          this.tableData = res.content || [];
          this.pageTotal = res.total || 0;
        }
      } catch (e) {
        console.error('Load scripts failed:', e);
      }
      this.loading = false;
    },
    async loadFilterOptions() {
      try {
        const res = await axios.get('/scripts/options/filters');
        if (res) {
          this.systemOptions = res.systems || [];
          this.typeOptions = res.types || [];
        }
      } catch (e) {
        // ignore
      }
    },
    openAddDialog() {
      this.isEdit = false;
      this.editId = null;
      this.form = { name: '', introduction: '', run_system: '', script_type: '', description: '', script_content: '', filename: '' };
      this.uploadFile = null;
      this.mdFileName = '';
      this.dialogVisible = true;
    },
    async openEditDialog(row) {
      this.isEdit = true;
      this.editId = row.id;
      try {
        const res = await axios.get(`/scripts/${row.id}`);
        if (res) {
          this.form = {
            name: res.name,
            introduction: res.introduction || '',
            run_system: res.run_system,
            script_type: res.script_type,
            description: res.description || '',
            script_content: res.script_content || '',
            filename: res.filename || ''
          };
          this.mdFileName = res.description_file || '';
        }
      } catch (e) {
        this.form = { ...row, script_content: '', filename: row.filename || '' };
      }
      this.uploadFile = null;
      this.mdFileName = '';
      this.dialogVisible = true;
    },
    onFileSelected(e) {
      const file = e.target.files[0];
      if (file) {
        this.uploadFile = file;
      }
      e.target.value = '';
    },
    onMdFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.mdFileName = file.name;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.form.description = ev.target.result;
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    async submitForm() {
      try {
        await this.$refs.formRef.validate();
      } catch { return; }

      this.submitting = true;
      try {
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('introduction', this.form.introduction || '');
        formData.append('run_system', this.form.run_system);
        formData.append('script_type', this.form.script_type);
        formData.append('description', this.form.description || '');
        formData.append('description_file', this.mdFileName || '');
        formData.append('script_content', this.form.script_content || '');
        formData.append('filename', this.form.filename || '');
        if (this.uploadFile) {
          formData.append('file', this.uploadFile);
        }

        if (this.isEdit) {
          await axios.put(`/scripts/${this.editId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await axios.post('/scripts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        ElMessage.success(this.isEdit ? 'Script updated' : 'Script added');
        this.dialogVisible = false;
        this.loadData();
        this.loadFilterOptions();
      } catch (e) {
        ElMessage.error('Operation failed');
      }
      this.submitting = false;
    },
    async viewScript(row) {
      try {
        const res = await axios.get(`/scripts/${row.id}`);
        if (res) {
          this.viewData = res;
          this.viewDialogVisible = true;
        }
      } catch (e) {
        ElMessage.error('Failed to load script');
      }
    },
    async deleteScript(row) {
      try {
        await ElMessageBox.confirm(
          `Are you sure to delete script "${row.name}"?`,
          'Confirm Delete',
          { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
        );
      } catch { return; }

      try {
        await axios.delete(`/scripts/${row.id}`);
        ElMessage.success('Script deleted');
        this.loadData();
        this.loadFilterOptions();
      } catch (e) {
        ElMessage.error('Failed to delete script');
      }
    },
    highlightScript(code, filename) {
      if (!code) return '';
      let html = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const ext = (filename || '').split('.').pop().toLowerCase();
      const isShell = ['sh', 'bash'].includes(ext);
      const isPython = ext === 'py';
      const isSql = ext === 'sql';
      const isBatch = ['bat', 'cmd', 'ps1'].includes(ext);

      // 注释
      if (isShell || isPython) {
        html = html.replace(/(#.*)$/gm, '<span class="hl-comment">$1</span>');
      } else if (isSql) {
        html = html.replace(/(--.*)$/gm, '<span class="hl-comment">$1</span>');
      } else if (isBatch) {
        html = html.replace(/(REM\s.*|::.*)$/gim, '<span class="hl-comment">$1</span>');
      }

      // 字符串
      html = html.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="hl-string">"$1"</span>');
      html = html.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="hl-string">\'$1\'</span>');

      // 变量
      if (isShell || isPython) {
        html = html.replace(/(\$\{[^}]+\})/g, '<span class="hl-var">$1</span>');
        html = html.replace(/(\$[A-Za-z_][A-Za-z_0-9]*)/g, '<span class="hl-var">$1</span>');
      }

      // 关键字
      let keywords;
      if (isShell) keywords = ['echo', 'if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'exit', 'source', 'export', 'readonly', 'local', 'unset', 'shift', 'read', 'test', 'true', 'false'];
      else if (isPython) keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'pass', 'break', 'continue', 'raise', 'print', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'];
      else if (isSql) keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'SET', 'VALUES', 'INTO', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'IF', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'TRIGGER', 'PROCEDURE', 'FUNCTION', 'BEGIN', 'COMMIT', 'ROLLBACK', 'GRANT', 'REVOKE', 'USE', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
      else keywords = [];

      if (keywords.length > 0) {
        const kwRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', isSql ? 'gi' : 'g');
        html = html.replace(kwRegex, (match, p1, offset, str) => {
          const before = str.substring(Math.max(0, offset - 30), offset);
          if (before.includes('class="hl-')) return match;
          return '<span class="hl-keyword">' + p1 + '</span>';
        });
      }

      // 管道和重定向
      if (isShell) {
        html = html.replace(/(\|)/g, '<span class="hl-pipe">$1</span>');
      }

      // shebang
      html = html.replace(/^(#!.*)$/gm, '<span class="hl-shebang">$1</span>');

      return html;
    },

    renderMarkdown(text) {
      if (!text) return '';
      // 解码 HTML 实体
      const decoded = text
        .replace(/&#8195;/g, '  ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      // marked v4: marked() 或 marked.parse()
      const fn = typeof marked === 'function' ? marked : marked.parse;
      return fn(decoded);
    },
    systemTagType(sys) {
      const map = { AIX: '', RHEL: 'success', CentOS: 'success', Ubuntu: 'success', Windows: 'warning', MySQL: 'danger', Redis: 'danger', Oracle: 'danger', DB2: 'danger' };
      return map[sys] || 'info';
    },
    formatTime(t) {
      if (!t) return '';
      return t.replace('T', ' ').replace(/\.\d+Z$/, '').slice(0, 19);
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
.page-title {
  position: relative;
  margin-bottom: 16px;
  padding: 16px 0 12px;
}
.title-glow {
  position: absolute;
  top: 0;
  left: 20%;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00c6ff, #7c3aed, #ec4899, transparent);
  border-radius: 2px;
  animation: glowSlide 4s ease-in-out infinite;
}
@keyframes glowSlide {
  0%, 100% { opacity: 0.6; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}
.gradient-text {
  margin: 0;
  font-size: 26px;
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
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
  letter-spacing: 0.5px;
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
.code-dot { width: 12px; height: 12px; border-radius: 50%; }
.code-dot.red { background: #f38ba8; }
.code-dot.yellow { background: #f9e2af; }
.code-dot.green { background: #a6e3a1; }
.code-title { margin-left: 8px; color: #6c7086; font-size: 13px; font-family: monospace; }
.code-content {
  margin: 0;
  padding: 16px;
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
.markdown-body {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  max-height: 400px;
  overflow: auto;
  text-align: left;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  margin: 12px 0 8px;
  color: #1e293b;
}
.markdown-body h1 { font-size: 20px; }
.markdown-body h2 { font-size: 17px; }
.markdown-body h3 { font-size: 15px; }
.markdown-body p { margin: 6px 0; }
.markdown-body code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Consolas', monospace;
}
.markdown-body pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}
.markdown-body pre code {
  background: none;
  padding: 0;
  color: inherit;
}
.markdown-body ul, .markdown-body ol {
  padding-left: 20px;
  margin: 6px 0;
}
.markdown-body blockquote {
  border-left: 3px solid #409eff;
  padding-left: 12px;
  margin: 8px 0;
  color: #606266;
}
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}
.markdown-body th, .markdown-body td {
  border: 1px solid #dcdfe6;
  padding: 6px 10px;
  text-align: left;
}
.markdown-body th { background: #f0f2f5; font-weight: 600; }
.hl-comment  { color: #6c7086; font-style: italic; }
.hl-string   { color: #a6e3a1; }
.hl-var      { color: #f9e2af; }
.hl-keyword  { color: #89b4fa; font-weight: 600; }
.hl-pipe     { color: #f38ba8; }
.hl-shebang  { color: #f38ba8; font-weight: 700; }
</style>

<style>
/* 脚本编辑框（非 scoped 才能穿透 textarea 样式） */
.script-textarea .el-textarea__inner {
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  tab-size: 2;
}
</style>
