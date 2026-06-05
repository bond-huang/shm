<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <h4>System Online Standardized Check</h4>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="Disk & LVM Check" name="1">
            <DiskCheck></DiskCheck>
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
import DiskCheck from "@/components/Linuxpage/checkitem/DiskCheck"

  export default {
    name: "LinuxStandardcheck",
    components: {
      DiskCheck,
    },
    data() {
      return {
        tableData: [{
          date: '2024-01-15',
          name: 'Linuxtest1-240115-check.html',
          address: '/Linuxtest1-240115-check.html'
        }, {
          date: '2024-01-16',
          name: 'Linuxtest1-240116-check.html',
          address: 'Linuxtest1-240116-check.html'
        }, {
          date: '2024-01-17',
          name: 'Linuxtest1-240117-check.html',
          address: '/Linuxtest1-240117-check.html'
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
