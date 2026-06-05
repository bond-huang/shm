<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <h4>Automatic Preventive Maintenance and Generate Report Automatically</h4>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Automatic PM" name="1">
          <el-descriptions class="margin-top" :column="3" :size="medium" border>
            <template #extra>
              <el-button type="primary" size="small">Generate Report</el-button>
              <el-button type="success" size="small" @click="$message.success('Refreshed')">Refresh</el-button>
            </template>
            <el-descriptions-item>
              <template #label>Host Type</template>
              {{ host.HostType }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>Host Name</template>
              {{ host.HostName }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>IP Address</template>
              {{ host.IPadd }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>Status</template>
              <el-tag :type="statusType" size="small">{{ host.StatusInfo }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>Category</template>
              {{ host.Category || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="Reports List" name="2">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column label="Date" prop="date"></el-table-column>
            <el-table-column label="Name" prop="name"></el-table-column>
            <el-table-column align="right" width="180">
              <template #default="scope">
                <el-button size="mini" @click="reportView(scope.row)">View</el-button>
                <el-button size="mini" type="primary" @click="reportDownload(scope.row)">Download</el-button>
                <el-button size="mini" type="danger" @click="reportDelete(scope.row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "HostAutoPM",
  props: {
    host: { type: Object, default: () => ({}) }
  },
  computed: {
    statusType() {
      const status = this.host.StatusInfo;
      if (status === 'Severe') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'success';
    }
  },
  data() {
    return {
      activeNames: ['1'],
      tableData: [
        { date: '2024-01-15', name: this.host.HostName + '-240115.html' },
        { date: '2024-01-16', name: this.host.HostName + '-240116.html' },
        { date: '2024-01-17', name: this.host.HostName + '-240117.html' }
      ]
    }
  },
  methods: {
    reportView(row) { console.log('View:', row); },
    reportDownload(row) { console.log('Download:', row); },
    reportDelete(row) { console.log('Delete:', row); }
  }
}
</script>
