<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <h4>Automatic Preventive Maintenance and Generate Report Automatically</h4>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="Automatic PM" name="1">
          <el-descriptions class="margin-top"
            :column="3"
            :size="medium" border>
            <template #extra>
              <el-button type="primary" size="small">Generate Report</el-button>
              <el-button type="success" size="small">Refresh</el-button>
            </template>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-star-off"></i>&nbsp;HostType
            </template>
            Linux
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-user"></i>&nbsp;HostName
            </template>
            Linuxtest1
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-location-outline"></i>&nbsp;IP Address
            </template>
            192.168.100.107
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="bi bi-info-circle"></i>&nbsp;StatusInfo
            </template>
            Health
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <i class="el-icon-document"></i>&nbsp;Description
            </template>
            Red Hat Enterprise Linux
          </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        <el-collapse-item title="Reports List" name="2">
          <el-table
            :data="tableData.filter(data => !search
            || data.date.toLowerCase().includes(search.toLowerCase())
            || data.name.toLowerCase().includes(search.toLowerCase()))"
            :span-method="arraySpanMethod"
            style="width: 100%">
            <el-table-column label="Date" prop="date"></el-table-column>
            <el-table-column label="Name" prop="name"></el-table-column>
            <el-table-column align="right" width="180">
              <template #header>
                <el-input v-model="search" size="mini" placeholder="Input keyword"/>
              </template>
              <template #default="scope">
                <el-button size="mini"
                @click="reportView(scope.$index, scope.row)">View</el-button>
                <el-button size="mini" type="primary"
                @click="reportDownload(scope.row)">Download</el-button>
                <el-button size="mini" type="danger"
                @click="reprotDelete(scope.row.modelId)">Delete</el-button>
              </template>
            </el-table-column>
            <el-table-column align="left" width="90">
              <template #header>
                <el-button size="mini" type="success"
                @click="()=> this.$router.push('/allsystems/update')">Refresh</el-button>
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
    name: "LinuxAutoPM",
    data() {
      return {
        tableData: [{
          date: '2024-01-15',
          name: 'Linuxtest1-240115.html',
          address: '/Linuxtest1-240115.html'
        }, {
          date: '2024-01-16',
          name: 'Linuxtest1-240116.html',
          address: 'Linuxtest1-240116.html'
        }, {
          date: '2024-01-17',
          name: 'Linuxtest1-240117.html',
          address: '/Linuxtest1-240117.html'
        }],
        search: '',
        activeNames: ['1']
      }
    },
    methods: {
      reportView(index, row) {
        console.log(index, row);
      },
      reportDownload(index, row) {
        console.log(index, row);
      },
      reprotDelete(index, row) {
        console.log(index, row);
      },
      arraySpanMethod({ columnIndex }) {
        if (columnIndex === 2) {
          return [1, 2];
        }
      },
      handleChange(val) {
        console.log(val);
      }
    },
  }
</script>
