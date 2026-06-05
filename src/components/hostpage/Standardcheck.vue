<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <h4>System Online Standardized Check</h4>
      <el-collapse v-model="activeNames">
        <el-collapse-item :title="checkTitle" name="1">
          <CheckTable :hostType="host.HostType"></CheckTable>
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
import CheckTable from "@/components/hostpage/checkitem/CheckTable"

export default {
  name: "HostStandardcheck",
  components: { CheckTable },
  props: {
    host: { type: Object, default: () => ({}) }
  },
  computed: {
    checkTitle() {
      return this.host.HostType === 'AIX' ? 'RootVG Check' : 'Disk & LVM Check';
    }
  },
  data() {
    return {
      activeNames: ['1'],
      tableData: [
        { date: '2024-01-15', name: this.host.HostName + '-240115-check.html' },
        { date: '2024-01-16', name: this.host.HostName + '-240116-check.html' }
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
