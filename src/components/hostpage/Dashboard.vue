<template>
  <div>
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
      <el-col :span="20" :offset="2">
        <el-divider></el-divider>
        <el-descriptions class="margin-top" title="Host Information" :column="3" :size="medium" border>
          <template #extra>
            <el-button type="success" size="small" @click="refresh">Refresh</el-button>
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
          <el-descriptions-item>
            <template #label><i class="bi bi-building"></i>&nbsp;Business Name</template>
            {{ host.BusinessName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label><i class="bi bi-geo-alt"></i>&nbsp;Data Center</template>
            {{ host.DataCenter || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-col>
    </el-row>
  </div>
</template>

<script>
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
        { label: 'Swap', value: 8, status: 'success', tooltip: 'Swap usage rate' },
        { label: 'FileSystem', value: 71, status: 'success', tooltip: 'The highest usage rate in the filesystems' }
      ]
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
    this.updateGauges();
  },
  methods: {
    updateGauges() {
      // 根据主机类型设置不同的默认值
      if (this.host.HostType === 'AIX') {
        this.gauges[0].value = 80; // CPU
        this.gauges[1].value = 73; // Memory
        this.gauges[2].value = 19; // Swap/PageSpace
        this.gauges[3].value = 95; // FileSystem
      } else if (this.host.HostType === 'Linux') {
        this.gauges[0].value = 45;
        this.gauges[1].value = 62;
        this.gauges[2].value = 8;
        this.gauges[3].value = 71;
      }

      // 更新状态
      this.gauges.forEach(gauge => {
        if (gauge.value >= 80) gauge.status = 'exception';
        else if (gauge.value >= 60) gauge.status = 'warning';
        else gauge.status = 'success';
      });
    },
    refresh() {
      this.updateGauges();
      this.$message.success('Refreshed');
    }
  }
}
</script>

<style>
.percentage-p {
  font-size: 40px;
}
</style>
