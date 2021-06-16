<template>
  <el-table
    :data="tableData"
    border
    :span-method="arraySpanMethod"
    style="width: 100%">
    <el-table-column label="Check Item" prop="date"></el-table-column>
    <el-table-column label="Description" prop="name"></el-table-column>
    <el-table-column align="right" width="180">
        <template #header>
        
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
</template>

<script>
  export default {
    name: "Rootvgck",
    data() {
      return {
        tableData: [{
          date: '2021-06-11',
          name: 'AIXtest1-210611.html',
          address: '/AIXtest1-210611.html'
        }, {
          date: '2021-06-12',
          name: 'AIXtest1-210612.html',
          address: 'AIXtest1-210612.html'
        }, {
          date: '2021-06-13',
          name: 'AIXtest1-210613.html',
          address: '/AIXtest1-210613.html'
        }],
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