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
    :percentage="psPercentage" 
    :stroke-width="10"
    :width="150"
    :status="psStatus">
    <template #default="{ percentage }">
      <span class="percentage-value">
        <p class="percentage-p">{{ percentage }}%</p>
      </span>
      <el-tooltip content="PageSpace usage rate" 
        placement="bottom" effect="light">
        <span class="percentage-label">PageSpace</span>
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
            <i class="bi bi-file-font"></i>&nbsp;Machine Type
          </template>
          9117-570
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-star-off"></i>&nbsp;Serial Number
          </template>
          65B4D6D
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-user"></i>&nbsp;HostName
          </template>
          AIXtest1
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-location-outline"></i>&nbsp;IP Address
          </template>
          192.168.100.100
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-door-closed"></i>&nbsp;Platform Firmware Level
          </template>
          SF240_418
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-type"></i>&nbsp;AIX Level
          </template>
          7100-04-03-1642
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-cpu"></i>&nbsp;CPU Entitled Capacity
          </template>
          0.20
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="bi bi-files"></i>&nbsp;Memory Size
          </template>
          2048MB
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
           <i class="bi bi-file-ppt"></i>&nbsp;Page Space Size
          </template>
          1024MB
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <i class="el-icon-document"></i>&nbsp;Description
          </template>
          IBM AIX test system
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      cpuPercentage: 80,
      memPercentage: 73,
      psPercentage: 19,
      fsPercentage: 95,
      cpuStatus: "success",
      memStatus: "success",
      psStatus: "success",
      fsStatus:"success",
    }
  },
  methods: {
    cupState() {
      if (this.cpuPercentage >= 60) {
        if (this.cpuPercentage < 80){
          this.cpuStatus = "warning";
        }
        else {
          this.cpuStatus = "exception";
        }
      }
    },
    memState() {
      if (this.memPercentage >= 70) {
        if (this.memPercentage < 90){
          this.memStatus = "warning";
        }
        else {
          this.memStatus = "exception";
        }
      }
    },
    psState() {
      if (this.psPercentage >= 40) {
        if (this.psPercentage < 70){
          this.psStatus = "warning";
        }
        else {
          this.psStatus = "exception";
        }
      }
    },
    fsState() {
      if (this.fsPercentage >= 70) {
        if (this.fsPercentage < 90){
          this.fsStatus = "warning";
        }
        else {
          this.fsStatus = "exception";
        }
      }
    },
  },
  mounted(){
    this.cupState();
    this.memState();
    this.psState();
    this.fsState();
  }
}
</script>

<style>
.percentage-p {
  font-size: 40px;
}
</style>