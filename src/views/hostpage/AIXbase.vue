<template>
  <div class="dashboard-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="Overview " name="first">
        <Dashboard></Dashboard>
      </el-tab-pane>
      <el-tab-pane label="Automatic PM" name="second">
        <AutoPM></AutoPM>
      </el-tab-pane>
      <el-tab-pane label="Standard Check" name="third">Online Standard Check</el-tab-pane>
      <el-tab-pane label="PowerHA Check" name="fourth">PowerHA Check</el-tab-pane>
      <el-tab-pane label="All Items Check" name="fifth">All Items Check</el-tab-pane>
    </el-tabs>
</div>
</template>

<script>
import Dashboard from "@/components/Hostpage/Dashboard"
import AutoPM from "@/components/Hostpage/AutoPM"

export default {
  name: "AIXbase",
  components: {
    Dashboard,
    AutoPM
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