<template>
  <div class="dashboard-container">
    <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
      <div v-for="gauge in gauges" :key="gauge.label" style="text-align: center;">
        <el-progress type="dashboard"
          :percentage="gauge.value"
          :stroke-width="10"
          :width="140"
          :status="gauge.status">
          <template #default="{ percentage }">
            <span class="percentage-value">
              <p class="percentage-p">{{ percentage }}%</p>
            </span>
            <el-tooltip :content="gauge.tooltip" placement="bottom" effect="light">
              <span class="percentage-label">{{ gauge.label }}</span>
            </el-tooltip>
          </template>
        </el-progress>
      </div>
    </div>

    <el-row style="margin-top: 20px;">
      <el-col :span="22" :offset="1">
        <el-divider></el-divider>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0;">Host Information</h4>
          <div>
            <el-button type="primary" size="small" @click="openAuthDialog">
              <i class="bi bi-shield-lock"></i> Authentication
            </el-button>
            <el-button type="success" size="small" @click="refresh">
              <i class="bi bi-arrow-clockwise"></i> Refresh
            </el-button>
          </div>
        </div>
        <el-descriptions :column="3" :size="'medium'" border>
          <!-- AIX 14项信息 -->
          <template v-if="host.HostType === 'AIX'">
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
            <el-descriptions-item>
              <template #label><i class="el-icon-location-outline"></i>&nbsp;Description</template>
              {{ host.BusinessName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-building"></i>&nbsp;Data Center</template>
              {{ host.DataCenter || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-hdd"></i>&nbsp;Machine Type</template>
              {{ sysInfo.machineType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-upc-scan"></i>&nbsp;Machine Serial Number</template>
              {{ sysInfo.serialNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-cpu"></i>&nbsp;Platform Firmware Level</template>
              {{ sysInfo.platformFirmware || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-type"></i>&nbsp;AIX Level</template>
              {{ sysInfo.aixLevel || sysInfo.osVersion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-speedometer"></i>&nbsp;CPU Entitled Capacity</template>
              {{ sysInfo.cpuEntitled || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-files"></i>&nbsp;Memory Size</template>
              {{ sysInfo.memorySize || (sysInfo.memTotal ? sysInfo.memTotal + ' MB' : '-') }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-file-ppt"></i>&nbsp;Page Space Size</template>
              {{ sysInfo.pageSpaceSize || '-' }}
            </el-descriptions-item>
          </template>

          <!-- Linux 信息 -->
          <template v-else>
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
            <el-descriptions-item>
              <template #label><i class="el-icon-location-outline"></i>&nbsp;Description</template>
              {{ host.BusinessName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-building"></i>&nbsp;Data Center</template>
              {{ host.DataCenter || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-type"></i>&nbsp;OS Version</template>
              {{ sysInfo.osVersion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-cpu"></i>&nbsp;Kernel</template>
              {{ sysInfo.kernel || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-door-closed"></i>&nbsp;Architecture</template>
              {{ sysInfo.architecture || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-hdd"></i>&nbsp;SELinux</template>
              {{ sysInfo.selinux || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-cpu"></i>&nbsp;CPU Cores</template>
              {{ sysInfo.cpuCores || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-files"></i>&nbsp;Memory Size</template>
              {{ sysInfo.memTotal ? sysInfo.memTotal + ' MB' : '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-file-ppt"></i>&nbsp;Swap Size</template>
              {{ sysInfo.swapTotal ? sysInfo.swapTotal + ' MB' : '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-clock"></i>&nbsp;Uptime</template>
              {{ sysInfo.uptime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label><i class="bi bi-speedometer"></i>&nbsp;Load Average</template>
              {{ sysInfo.loadAvg || '-' }}
            </el-descriptions-item>
          </template>
        </el-descriptions>
      </el-col>
    </el-row>

    <!-- SSH 认证弹窗 -->
    <el-dialog v-model="authDialogVisible" title="SSH Authentication" width="420px" :close-on-click-modal="false">
      <p style="margin: 0 0 16px; color: #909399; font-size: 13px;">
        Configure SSH credentials for <b>{{ host.HostName }}</b> ({{ host.IPadd }})
      </p>
      <el-form :model="authForm" :rules="authRules" ref="authFormRef" label-width="90px" size="small">
        <el-form-item label="Username" prop="ssh_user">
          <el-input v-model="authForm.ssh_user" placeholder="e.g. root" />
        </el-form-item>
        <el-form-item label="Password" prop="ssh_password">
          <el-input v-model="authForm.ssh_password" type="password" show-password placeholder="SSH password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="testConnection" :loading="testLoading">
          <i class="bi bi-lightning"></i> Test Connection
        </el-button>
        <el-button size="small" @click="authDialogVisible = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="saveAuth" :loading="saveLoading">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { saveSshCredentials, getSshCredentials } from "@/api/demo.js"
import { getRealtimePerf } from "@/api/perf.js"
import { ElMessage, ElLoading } from 'element-plus'

export default {
  name: "HostDashboard",
  props: {
    host: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      gauges: [
        { label: 'CPU', value: 45, status: 'success', tooltip: 'Processor usage rate' },
        { label: 'Memory', value: 62, status: 'success', tooltip: 'Physical memory usage rate' },
        { label: 'PageSpace', value: 8, status: 'success', tooltip: 'PageSpace usage rate' },
        { label: 'FileSystem', value: 71, status: 'success', tooltip: 'The highest usage rate in the filesystems' }
      ],
      sysInfo: {
        osVersion: '',
        kernel: '',
        hostname: '',
        architecture: '',
        selinux: '',
        cpuCores: '',
        memTotal: '',
        swapTotal: '',
        uptime: '',
        loadAvg: '',
        // AIX 特有字段
        machineType: '',
        serialNumber: '',
        platformFirmware: '',
        aixLevel: '',
        cpuEntitled: '',
        memorySize: '',
        pageSpaceSize: ''
      },
      authDialogVisible: false,
      testLoading: false,
      saveLoading: false,
      authForm: {
        ssh_user: '',
        ssh_password: ''
      },
      authRules: {
        ssh_user: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
        ssh_password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
      }
    }
  },
  computed: {
    statusType() {
      const status = this.host.StatusInfo;
      if (status === 'Severe') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'success';
    }
  },
  mounted() {
    this.loadCachedData();
  },
  watch: {
    'host.HostId'(val) {
      if (val) this.loadCachedData();
    }
  },
  methods: {
    updateGauges() {
      if (this.host.HostType === 'AIX') {
        this.gauges[0].value = 80;
        this.gauges[1].value = 73;
        this.gauges[2].value = 19;
        this.gauges[3].value = 95;
      } else if (this.host.HostType === 'Linux') {
        this.gauges[0].value = 45;
        this.gauges[1].value = 62;
        this.gauges[2].value = 8;
        this.gauges[3].value = 71;
      }

      this.gauges.forEach(gauge => {
        if (gauge.value >= 80) gauge.status = 'exception';
        else if (gauge.value >= 60) gauge.status = 'warning';
        else gauge.status = 'success';
      });
    },
    loadCachedData() {
      if (!this.host.HostId) {
        this.updateGauges();
        return;
      }
      const key = `host_perf_${this.host.HostId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.gauges) this.gauges = data.gauges;
          if (data.sysInfo) this.sysInfo = data.sysInfo;
        } catch (e) {
          this.updateGauges();
        }
      } else {
        this.updateGauges();
      }
    },
    saveCachedData() {
      if (!this.host.HostId) return;
      const key = `host_perf_${this.host.HostId}`;
      localStorage.setItem(key, JSON.stringify({
        gauges: this.gauges,
        sysInfo: this.sysInfo
      }));
    },
    async refresh() {
      if (!this.host.HostId) return;

      const loading = ElLoading.service({ target: '.dashboard-container', text: 'Fetching data...' });
      try {
        const res = await getRealtimePerf(this.host.HostId);
        if (res && res.cpu) {
          // CPU
          const cpuUsed = parseFloat((res.cpu.user + res.cpu.system + res.cpu.iowait).toFixed(1));
          this.gauges[0].value = cpuUsed;

          // Memory
          if (res.memory) {
            this.gauges[1].value = res.memory.usagePercent || 0;
          }

          // PageSpace (AIX only)
          if (res.pageSpace) {
            this.gauges[2].value = res.pageSpace.usedPercent || 0;
          }

          // FileSystem
          if (res.disk && res.disk.length > 0) {
            const maxUsage = Math.max(...res.disk.map(d => d.usePercent));
            this.gauges[3].value = maxUsage;
          }

          // 状态颜色
          this.gauges.forEach(gauge => {
            if (gauge.value >= 80) gauge.status = 'exception';
            else if (gauge.value >= 60) gauge.status = 'warning';
            else gauge.status = 'success';
          });

          // 系统信息
          if (res.systemInfo) {
            this.sysInfo = {
              osVersion: res.systemInfo.osVersion || '',
              kernel: res.systemInfo.kernel || '',
              hostname: res.hostname || '',
              architecture: res.systemInfo.architecture || '',
              selinux: res.systemInfo.selinux || '',
              cpuCores: res.systemInfo.cpuCores || '',
              memTotal: res.systemInfo.memTotal || '',
              swapTotal: res.systemInfo.swapTotal || '',
              uptime: res.uptime || '',
              loadAvg: res.loadAvg ? `${res.loadAvg['1min']} / ${res.loadAvg['5min']} / ${res.loadAvg['15min']}` : '',
              // AIX 特有字段
              machineType: res.systemInfo.machineType || '',
              serialNumber: res.systemInfo.serialNumber || '',
              platformFirmware: res.systemInfo.platformFirmware || '',
              aixLevel: res.systemInfo.aixLevel || '',
              cpuEntitled: res.systemInfo.cpuEntitled || '',
              memorySize: res.systemInfo.memorySize || '',
              pageSpaceSize: res.systemInfo.pageSpaceSize || ''
            };
          }

          this.saveCachedData();
          ElMessage.success(`Refreshed — ${res.hostname}`);
        } else {
          ElMessage.warning(res?.statusMessage || 'No data returned');
        }
      } catch (e) {
        ElMessage.error('Failed to fetch data');
      }
      loading.close();
    },
    async openAuthDialog() {
      this.authDialogVisible = true;
      try {
        const res = await getSshCredentials(this.host.HostId);
        if (res) {
          this.authForm.ssh_user = res.ssh_user || '';
          this.authForm.ssh_password = '';
        }
      } catch (e) {
        // 忽略
      }
    },
    async testConnection() {
      try {
        await this.$refs.authFormRef.validate();
      } catch { return; }

      this.testLoading = true;
      try {
        await saveSshCredentials(this.host.HostId, this.authForm.ssh_user, this.authForm.ssh_password);
        const res = await getRealtimePerf(this.host.HostId);
        if (res && res.hostname) {
          ElMessage.success(`Connected! Hostname: ${res.hostname}`);
        } else {
          ElMessage.error(res?.statusMessage || 'Connection failed');
        }
      } catch (e) {
        ElMessage.error('Connection failed');
      }
      this.testLoading = false;
    },
    async saveAuth() {
      try {
        await this.$refs.authFormRef.validate();
      } catch { return; }

      this.saveLoading = true;
      try {
        await saveSshCredentials(this.host.HostId, this.authForm.ssh_user, this.authForm.ssh_password);
        ElMessage.success('SSH credentials saved');
        this.authDialogVisible = false;
      } catch (e) {
        ElMessage.error('Save failed');
      }
      this.saveLoading = false;
    }
  }
}
</script>

<style>
.percentage-p {
  font-size: 40px;
}
</style>
