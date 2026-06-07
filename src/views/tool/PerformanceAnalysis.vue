<template>
  <div>
    <div class="page-header">
      <el-button class="back-btn" size="small" @click="$router.push('/tool-analysis')">
        <i class="bi bi-arrow-left"></i>
      </el-button>
      <div class="header-info">
        <div class="header-tags">
          <span class="type-badge" style="background: linear-gradient(135deg, #f97316, #ef4444);">
            <i class="bi bi-speedometer2"></i> Performance Analysis
          </span>
        </div>
      </div>
      <div class="header-glow"></div>
    </div>

    <!-- 工具卡片 -->
    <el-row :gutter="20" style="margin-bottom: 16px;">
      <el-col :span="8">
        <el-card shadow="hover" class="tool-card" @click="showSVC = true">
          <div class="tool-content">
            <div class="tool-icon" style="background: linear-gradient(135deg, #f97316, #ef4444);">
              <i class="bi bi-hdd-rack"></i>
            </div>
            <div class="tool-info">
              <h4>SVC Performance Analysis</h4>
              <p>Analyze SVC I/O Group CPU performance from CSV data</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- SVC 分析工具 -->
    <el-card v-if="showSVC" style="margin-bottom: 16px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;"><i class="bi bi-hdd-rack"></i> SVC Performance Analysis</span>
          <el-button size="mini" type="text" @click="showSVC = false"><i class="bi bi-x-lg"></i></el-button>
        </div>
      </template>
      <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-end;">
        <div>
          <div style="font-size: 13px; color: #606266; margin-bottom: 6px;">Analysis Name</div>
          <el-input v-model="form.name" placeholder="e.g. SVC IO Group Report" size="small" style="width: 220px;" />
        </div>
        <div>
          <div style="font-size: 13px; color: #606266; margin-bottom: 6px;">CSV Data File</div>
          <el-button size="small" @click="$refs.csvInput.click()">
            <i class="bi bi-file-earmark-spreadsheet"></i>
            {{ csvFile ? csvFile.name : 'Choose CSV' }}
          </el-button>
          <input ref="csvInput" type="file" accept=".csv,.xlsx,.xls" style="display:none;" @change="onCsvSelected" />
        </div>
        <div>
          <div style="font-size: 13px; color: #606266; margin-bottom: 6px;">Analysis Script</div>
          <el-tag size="small" type="info"><i class="bi bi-file-earmark-code"></i> SVC-IOGRP-Perf.py</el-tag>
        </div>
        <el-button type="primary" size="small" @click="runAnalysis" :loading="running" :disabled="!csvFile">
          <i class="bi bi-play-fill"></i> Analyze
        </el-button>
      </div>
    </el-card>

    <!-- 错误信息 -->
    <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon closable style="margin-bottom: 16px;" @close="errorMsg = ''" />

    <!-- 历史记录 -->
    <el-card>
      <template #header>
        <span style="font-weight: 600;">Analysis History</span>
      </template>
      <el-table :data="history" style="width: 100%" v-loading="loading" empty-text="No analysis records">
        <el-table-column prop="name" label="Name" width="200"></el-table-column>
        <el-table-column prop="csv_filename" label="CSV File" width="220" show-overflow-tooltip></el-table-column>
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Time" width="160">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column align="right" width="120">
          <template #default="scope">
            <div style="display: flex; gap: 4px; justify-content: flex-end;">
              <el-tooltip content="View Result" placement="top">
                <el-button size="mini" class="icon-btn" @click="viewResult(scope.row)" :disabled="scope.row.status !== 'completed'">
                  <i class="bi bi-eye"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip content="Delete" placement="top">
                <el-button size="mini" type="danger" class="icon-btn" @click="deleteRecord(scope.row)">
                  <i class="bi bi-trash"></i>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 结果弹窗 -->
    <el-dialog v-model="resultVisible" :title="resultTitle" width="85%" top="5vh" :close-on-click-modal="false">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 600; font-size: 16px;">{{ resultTitle }}</span>
          <el-button size="mini" type="primary" @click="downloadResult">
            <i class="bi bi-download"></i> Download HTML
          </el-button>
        </div>
      </template>
      <div class="result-frame" v-html="resultHtml"></div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: "PerformanceAnalysis",
  data() {
    return {
      showSVC: true,
      form: { name: 'SVC IO Group Analysis' },
      csvFile: null,
      running: false,
      errorMsg: '',
      history: [],
      loading: false,
      resultVisible: false,
      resultTitle: '',
      resultHtml: ''
    }
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    onCsvSelected(e) {
      if (e.target.files[0]) this.csvFile = e.target.files[0];
      e.target.value = '';
    },
    async runAnalysis() {
      if (!this.csvFile) return;
      this.running = true;
      this.errorMsg = '';

      try {
        const formData = new FormData();
        formData.append('name', this.form.name || 'SVC Analysis');
        formData.append('csv', this.csvFile);
        // 使用内置的 SVC 分析脚本，通过特殊标记让后端使用内置脚本
        formData.append('script_name', 'SVC-IOGRP-Perf.py');

        const res = await axios.post('/analysis/run-builtin', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res && res.status === 'completed') {
          this.resultTitle = this.form.name || 'SVC Analysis Result';
          this.resultHtml = res.html;
          this.resultVisible = true;
          ElMessage.success('Analysis completed');
          this.loadHistory();
        } else {
          this.errorMsg = res?.error || 'Analysis failed';
          ElMessage.error('Analysis failed');
          this.loadHistory();
        }
      } catch (e) {
        this.errorMsg = 'Failed to run analysis';
        ElMessage.error('Failed to run analysis');
      }
      this.running = false;
    },
    async loadHistory() {
      this.loading = true;
      try {
        const res = await axios.get('/analysis/list');
        if (res) this.history = res;
      } catch (e) { /* ignore */ }
      this.loading = false;
    },
    async viewResult(row) {
      try {
        const res = await axios.get(`/analysis/${row.id}`);
        if (res && res.result_html) {
          this.resultTitle = row.name;
          this.resultHtml = res.result_html;
          this.resultVisible = true;
        }
      } catch (e) {
        ElMessage.error('Failed to load result');
      }
    },
    downloadResult() {
      const blob = new Blob([this.resultHtml], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${this.resultTitle || 'analysis'}.html`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    async deleteRecord(row) {
      try {
        await ElMessageBox.confirm(`Delete analysis "${row.name}"?`, 'Confirm', { type: 'warning' });
      } catch { return; }
      try {
        await axios.delete(`/analysis/${row.id}`);
        ElMessage.success('Deleted');
        this.loadHistory();
      } catch (e) {
        ElMessage.error('Failed to delete');
      }
    },
    statusType(s) {
      if (s === 'completed') return 'success';
      if (s === 'failed') return 'danger';
      if (s === 'running') return 'warning';
      return 'info';
    },
    formatTime(t) {
      if (!t) return '';
      return t.replace('T', ' ').replace(/\.\d+Z$/, '').slice(0, 19);
    }
  }
}
</script>

<style scoped>
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.header-glow {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(90deg, #f97316, #ef4444);
}
.back-btn {
  border-radius: 10px;
  width: 36px; height: 36px;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  margin-right: 16px;
}
.header-info { flex: 1; }
.header-tags { display: flex; align-items: center; gap: 10px; }
.type-badge {
  display: inline-flex;
  align-items: center; gap: 5px;
  padding: 5px 14px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.tool-card {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}
.tool-card :deep(.el-card__body) { padding: 18px; }
.tool-content { display: flex; align-items: center; gap: 14px; }
.tool-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.tool-icon i { font-size: 20px; color: #fff; }
.tool-info { flex: 1; }
.tool-info h4 { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1e293b; }
.tool-info p { margin: 0; font-size: 12px; color: #94a3b8; }
.icon-btn {
  padding: 4px 6px !important;
  min-width: 28px !important; max-width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center; justify-content: center;
}
.result-frame {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  max-height: 70vh;
  overflow: auto;
}
</style>
