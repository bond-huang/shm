<template>
  <div>
    <div class="page-header">
      <el-button size="small" @click="$router.push('/system-class')">
        <i class="bi bi-arrow-left"></i> Back
      </el-button>
      <h3>{{ categoryName }}</h3>
      <el-tag size="small">{{ hosts.length }} Systems</el-tag>
    </div>

    <el-table :data="hosts" stripe border style="width: 100%" v-loading="loading">
      <el-table-column prop="HostType" label="HostType" width="90"></el-table-column>
      <el-table-column prop="HostName" label="HostName" width="120"></el-table-column>
      <el-table-column prop="IPadd" label="IP Addr" width="130"></el-table-column>
      <el-table-column prop="StatusInfo" label="Status" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.StatusInfo)" size="mini">{{ row.StatusInfo }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="BusinessName" label="Business Name" min-width="150"></el-table-column>
      <el-table-column prop="DataCenter" label="Data Center" width="120"></el-table-column>
      <el-table-column align="right" width="150">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-end; gap: 4px;">
            <el-button size="mini" style="padding: 4px 8px; font-size: 12px;" @click="viewHost(scope.row)">View</el-button>
            <el-button size="mini" style="padding: 4px 8px; font-size: 12px;" @click="editHost(scope.row)">Edit</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getCategoryHosts } from "@/api/demo.js"

export default {
  name: "CategoryDetail",
  data() {
    return {
      categoryName: '',
      hosts: [],
      loading: false
    }
  },
  mounted() {
    this.categoryName = this.$route.params.name;
    this.loadHosts();
  },
  methods: {
    async loadHosts() {
      this.loading = true;
      const res = await getCategoryHosts(this.categoryName);
      if (res) {
        this.hosts = res;
      }
      this.loading = false;
    },
    getStatusType(status) {
      if (status === 'Severe') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'success';
    },
    viewHost(row) {
      this.$router.push({
        name: 'host-detail',
        params: { id: row.HostId }
      });
    },
    editHost(row) {
      this.$router.push({
        name: 'update',
        params: {
          HostId: row.HostId,
          HostType: row.HostType,
          HostName: row.HostName,
          IPadd: row.IPadd,
          StatusInfo: row.StatusInfo,
          Category: row.Category,
          BusinessName: row.BusinessName,
          DataCenter: row.DataCenter
        }
      });
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
  flex: 1;
}
</style>
