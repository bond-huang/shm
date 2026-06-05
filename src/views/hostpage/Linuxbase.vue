<template>
  <div class="dashboard-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Overview " name="first">
        <Dashboard></Dashboard>
      </el-tab-pane>
      <el-tab-pane label="Automatic PM" name="second">
        <AutoPM></AutoPM>
      </el-tab-pane>
      <el-tab-pane label="Standard Check" name="third">
        <Standardcheck/>
      </el-tab-pane>
      <el-tab-pane label="Cluster Check" name="fourth">Cluster Check (Pacemaker)</el-tab-pane>
      <el-tab-pane label="Performance Check" name="fifth">
        <Performance/>
      </el-tab-pane>
      <el-tab-pane label="All Items Check" name="sixth">All Items Check</el-tab-pane>
    </el-tabs>
</div>
</template>

<script>
import Dashboard from "@/components/Linuxpage/Dashboard"
import AutoPM from "@/components/Linuxpage/AutoPM"
import Standardcheck from "@/components/Linuxpage/Standardcheck"
import Performance from "@/components/Linuxpage/Performance"

export default {
  name: "Linuxbase",
  components: {
    Dashboard,
    AutoPM,
    Standardcheck,
    Performance,
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
