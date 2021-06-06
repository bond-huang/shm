<template>
  <div class="dashboard-container">
    <el-progress type="circle" 
      :percentage="100" 
      :stroke-width="20"
      :width="200"> 
      <span class="percentage-value">
        <p class="dashboard-p">{{ statisticsList.allHosts }}</p>
      </span>
      <el-tooltip content="All hosts managed by this system" 
        placement="bottom" effect="light">
        <span class="percentage-label">All Hosts</span>
      </el-tooltip>
    </el-progress>
      &nbsp;&nbsp;
    <el-progress type="circle" 
      :percentage="100" 
      :stroke-width="15"
      :width="200"
      status="success"> 
      <span class="percentage-value">
        <p class="dashboard-p">{{ statisticsList.healthHosts }}</p>
      </span>
      <el-tooltip content="The number of hosts in a healthy state" 
        placement="bottom" effect="light">
        <span class="percentage-label">Health</span>
      </el-tooltip>
    </el-progress>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <el-progress type="circle" 
      :percentage="100" 
      :stroke-width="15"
      :width="200"
      status="warning">
      <span class="percentage-value">
        <p class="dashboard-p">{{ statisticsList.warningHosts }}</p>
      </span>
      <el-tooltip content="The hosts in warning status need attention" 
        placement="bottom" effect="light">
        <span class="percentage-label">Warning</span>
      </el-tooltip>
    </el-progress>
      &nbsp;&nbsp;
    <el-progress type="circle"
      :percentage="100" 
      :stroke-width="15"
      :width="200"
      status="exception">
      <span class="percentage-value">
        <p class="dashboard-p">{{ statisticsList.severeHosts }}</p>
      </span>
      <el-tooltip content="Severely faulty hosts need to be fixed immediately" 
        placement="bottom" effect="light">
        <span class="percentage-label">Severe</span>
      </el-tooltip>
    </el-progress>
    <el-row>
      <el-col :span="20" :offset="2">
        <el-divider></el-divider>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="20" :offset="2">
        <el-tooltip content="View list of all managed hosts" 
          placement="bottom" effect="light">
          <el-button type="primary">All Hosts List</el-button>
        </el-tooltip>
        <el-tooltip content="View list of all healthy hosts" 
          placement="bottom" effect="light">
          <el-button type="success">Healthy Hosts</el-button>
        </el-tooltip>
        <el-tooltip content="View list of the hosts in Warning status" 
          placement="bottom" effect="light">
          <el-button type="warning">Warning Hosts</el-button>
        </el-tooltip>
        <el-tooltip content="View list of the hosts in Severe status" 
          placement="bottom" effect="light">
          <el-button type="danger">Severe Hosts</el-button>
        </el-tooltip>
      </el-col>
    </el-row>
      &nbsp;&nbsp;
    <el-row>
      <el-col :span="20" :offset="2">
        <h2>Proactive Operating System Health Check Tool</h2>
          <p style="font-size: 20px;">
            Single Configuration Check;Compliance Check;
            Monthly PM and Generate Reports Automatically
          </p>
      </el-col>
    </el-row>
  </div>
</template>


<script>
import { getStatistics } from "@/api/dashboard.js";

export default {
  name: "dashboard",
  data() {
    return {
      statisticsList: [],
    }
  },
  mounted(){
    getStatistics().then(resp => {
      this.statisticsList = resp
    })
  },
}
</script>

<style>
.dashboard-p {
  font-size: 60px;
}
</style>
