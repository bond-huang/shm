<template>
  <div class="dashboard-container">
    <div class="host-header">
      <h3>{{ hostInfo.HostName }} ({{ hostInfo.IPadd }})</h3>
      <el-tag :type="statusType" size="small">{{ hostInfo.StatusInfo }}</el-tag>
    </div>

    <el-tabs v-model="activeName">
      <el-tab-pane label="Overview" name="first">
        <Dashboard :host="hostInfo"></Dashboard>
      </el-tab-pane>
      <el-tab-pane label="Automatic PM" name="second">
        <AutoPM :host="hostInfo"></AutoPM>
      </el-tab-pane>
      <el-tab-pane label="Standard Check" name="third">
        <Standardcheck :host="hostInfo"></Standardcheck>
      </el-tab-pane>
      <el-tab-pane label="Performance Check" name="fourth">
        <Performance :host="hostInfo"></Performance>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getSystems } from "@/api/demo.js"
import Dashboard from "@/components/hostpage/Dashboard"
import AutoPM from "@/components/hostpage/AutoPM"
import Standardcheck from "@/components/hostpage/Standardcheck"
import Performance from "@/components/hostpage/Performance"

export default {
  name: "HostDetail",
  components: {
    Dashboard,
    AutoPM,
    Standardcheck,
    Performance,
  },
  data() {
    return {
      activeName: 'first',
      hostInfo: {}
    }
  },
  computed: {
    statusType() {
      const status = this.hostInfo.StatusInfo;
      if (status === 'Severe') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'success';
    }
  },
  mounted() {
    const hostId = this.$route.params.id;
    this.loadHostInfo(hostId);
  },
  methods: {
    async loadHostInfo(hostId) {
      const res = await getSystems(1, 100);
      if (res) {
        const host = res.content.find(h => h.HostId == hostId);
        if (host) {
          this.hostInfo = host;
        } else {
          this.$message.error('Host not found');
          this.$router.push('/allsystems');
        }
      }
    }
  }
}
</script>

<style scoped>
.host-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.host-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
</style>
