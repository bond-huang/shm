<template>
  <el-progress type="dashboard"
    :percentage="cpuPercentage"
    :stroke-width="10"
    :width="150"
    :status="cpuStatus">
    <template #default="{ percentage }">
      <span class="percentage-value">
        <p class="percentage-p">{{ percentage }}%</p>
      </span>
      <el-tooltip content="Processor usage rate"
        placement="bottom" effect="light">
        <span class="percentage-label">CPU</span>
      </el-tooltip>
    </template>
  </el-progress>
    &nbsp;&nbsp;
  <el-progress type="dashboard"
    :percentage="memPercentage"
    :stroke-width="10"
    :width="150"
    :status="memStatus">
    <template #default="{ percentage }">
      <span class="percentage-value">
        <p class="percentage-p">{{ percentage }}%</p>
      </span>
      <el-tooltip content="Physical memory usage rate"
        placement="bottom" effect="light">
        <span class="percentage-label">Memory</span>
      </el-tooltip>
    </template>
  </el-progress>
    &nbsp;&nbsp;
  <el-progress type="dashboard"
    :percentage="swapPercentage"
    :stroke-width="10"
    :width="150"
    :status="swapStatus">
    <template #default="{ percentage }">
      <span class="percentage-value">
        <p class="percentage-p">{{ percentage }}%</p>
      </span>
      <el-tooltip content="Swap usage rate"
        placement="bottom" effect="light">
        <span class="percentage-label">Swap</span>
      </el-tooltip>
    </template>
  </el-progress>
    &nbsp;&nbsp;
  <el-progress type="dashboard"
    :percentage="fsPercentage"
    :stroke-width="10"
    :width="150"
    :status="fsStatus">
    <template #default="{ percentage }">
      <span class="percentage-value">
        <p class="percentage-p">{{ percentage }}%</p>
      </span>
      <el-tooltip content="The highest usage rate in the filesystems"
        placement="bottom" effect="light">
        <span class="percentage-label">FileSystem</span>
      </el-tooltip>
    </template>
  </el-progress>
  <el-row>
    <el-col :span="20" :offset="2">
      <el-divider></el-divider>
      <el-descriptions class="margin-top"
        title="Host Information"
        :column="3"
        :size="medium" border>
        <template #extra>
          <el-button type="success" size="small">Refresh</el-button>
        </template>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-type"></i>&nbsp;OS Version
          </template>
          Red Hat Enterprise Linux 8.6
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-cpu"></i>&nbsp;Kernel
          </template>
          4.18.0-372.9.1.el8.x86_64
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>&nbsp;HostName
          </template>
          Linuxtest1
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-location-outline"></i>&nbsp;IP Address
          </template>
          192.168.100.107
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-door-closed"></i>&nbsp;Architecture
          </template>
          x86_64
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-hdd"></i>&nbsp;SELinux
          </template>
          Enforcing
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-cpu"></i>&nbsp;CPU Cores
          </template>
          4
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-files"></i>&nbsp;Memory Size
          </template>
          8192MB
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
           <i class="bi bi-file-ppt"></i>&nbsp;Swap Size
          </template>
          4096MB
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-document"></i>&nbsp;Description
          </template>
          Red Hat Enterprise Linux
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "LinuxDashboard",
  data() {
    return {
      cpuPercentage: 45,
      memPercentage: 62,
      swapPercentage: 8,
      fsPercentage: 71,
      cpuStatus: "success",
      memStatus: "success",
      swapStatus: "success",
      fsStatus: "success",
    }
  },
  methods: {
    cpuState() {
      if (this.cpuPercentage >= 60) {
        if (this.cpuPercentage < 80) this.cpuStatus = "warning";
        else this.cpuStatus = "exception";
      }
    },
    memState() {
      if (this.memPercentage >= 70) {
        if (this.memPercentage < 90) this.memStatus = "warning";
        else this.memStatus = "exception";
      }
    },
    swapState() {
      if (this.swapPercentage >= 40) {
        if (this.swapPercentage < 70) this.swapStatus = "warning";
        else this.swapStatus = "exception";
      }
    },
    fsState() {
      if (this.fsPercentage >= 70) {
        if (this.fsPercentage < 90) this.fsStatus = "warning";
        else this.fsStatus = "exception";
      }
    },
  },
  mounted() {
    this.cpuState();
    this.memState();
    this.swapState();
    this.fsState();
  }
}
</script>

<style>
.percentage-p {
  font-size: 40px;
}
</style>
