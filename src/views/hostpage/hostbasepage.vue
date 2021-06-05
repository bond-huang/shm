<template>
  <div class="dashboard-container">

<el-progress type="dashboard" 
  :percentage="cpuPercentage" 
  :stroke-width="15"
  :width="200"
  :status="cpuStatus"> 
  <template #default="{ percentage }">
    <span class="percentage-value">{{ percentage }}%</span>
    <span class="percentage-label">CPU</span>
  </template>
</el-progress>

<el-progress type="dashboard" 
  :percentage="memPercentage" 
  :stroke-width="15"
  :width="200"
  :status="memStatus">
  <template #default="{ percentage }">
    <span class="percentage-value">{{ percentage }}%</span>
    <span class="percentage-label">Memory</span>
  </template>
</el-progress>

<el-progress type="dashboard"
  :percentage="psPercentage" 
  :stroke-width="15"
  :width="200"
  :status="psStatus">
  <template #default="{ percentage }">
    <span class="percentage-value">{{ percentage }}%</span>
    <span class="percentage-label">PageSpace</span>
  </template>
</el-progress>

  </div>
</template>

<script>
export default {
  name: "dashboard",
  data() {
    return {
      cpuPercentage: 43,
      memPercentage: 73,
      psPercentage: 90,
      cpuStatus: "success",
      memStatus: "success",
      psStatus: "success",
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
    }
  },
  mounted(){
    this.cupState();
    this.memState();
    this.psState();
  }
}
</script>