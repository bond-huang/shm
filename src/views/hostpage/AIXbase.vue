<template>
  <div class="dashboard-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Overview " name="first">
        <Dashboard></Dashboard>
            <el-row>
      <el-col :span="20" :offset="2">
        <el-divider></el-divider>
    <el-descriptions class="margin-top" title="Host Information" :column="3" :size="medium" border>
    <template #extra>
      <el-button type="success" size="small">Refresh</el-button>
    </template>
    <el-descriptions-item>
      <template #label>
        <i class="el-icon-user"></i>
        HostType
      </template>
      AIX
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <i class="el-icon-mobile-phone"></i>
        HostName
      </template>
     AIXtest1
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <i class="el-icon-location-outline"></i>
       IP Address
      </template>
      192.168.100.100
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <i class="el-icon-tickets"></i>
        StatusInfo
      </template>
      Health
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <i class="el-icon-office-building"></i>
        Description
      </template>
      IBM AIX test system
    </el-descriptions-item>
  </el-descriptions>


      </el-col>
    </el-row>
      </el-tab-pane>

      <el-tab-pane label="Automatic PM" name="second">
        Automatic Preventive Maintenance
      </el-tab-pane>
      <el-tab-pane label="Standard Check" name="third">Online Standard Check</el-tab-pane>
      <el-tab-pane label="PowerHA Check" name="fourth">PowerHA Check</el-tab-pane>
      <el-tab-pane label="All Items Check" name="fifth">All Items Check</el-tab-pane>
    </el-tabs>
</div>
</template>

<script>
import Dashboard from "@/components/Hostpage/Dashboard"

export default {
  name: "AIXbase",
  components: {
    Dashboard
  },
  data() {
    return {
      activeName: 'first'
    }
  },
  methods: {
    handleClick(tab, event) {
        console.log(tab, event);
    }
  },
}
</script>