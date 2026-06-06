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
            <el-table-column align="right" width="240">
              <template #default="scope">
                <el-button size="mini" @click="reportView(scope.row)">
                  <i class="bi bi-eye"></i> View
                </el-button>
                <el-button size="mini" type="primary" @click="reportDownload(scope.row)">
                  <i class="bi bi-download"></i> Download
                </el-button>
                <el-button size="mini" type="danger" @click="reportDelete(scope.row)">
                  <i class="bi bi-trash3"></i> Delete
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-col>

    <!-- 巡检脚本弹窗 -->
    <el-dialog v-model="scriptDialogVisible" title="Inspection Script" width="700px">
      <pre class="script-content">{{ scriptContent }}</pre>
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
    }
  },
  data() {
    return {
      activeNames: ['1', '2'],
      tableData: [],
      loadingList: false,
      generating: false,
      scriptDialogVisible: false,
      scriptContent: ''
    }
  },
  mounted() {
    this.loadReports();
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
    async showScript() {
      try {
        const res = await axios.get('/reports/script');
        if (res) {
          this.scriptContent = res.script;
          this.scriptDialogVisible = true;
        }
      } catch (e) {
        ElMessage.error('Failed to load script');
      }
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
        const res = await axios.delete(`/reports/${this.host.HostId}/${row.name}`);
        if (res) {
          ElMessage.success('Report deleted');
          this.loadReports();
        } else {
          ElMessage.error('Delete failed');
        }
      } catch (e) {
        ElMessage.error('Failed to delete report');
      }
    }
  }
}
</script>

<style scoped>
.script-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
