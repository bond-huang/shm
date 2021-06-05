<template>
  <div>
    <el-table 
    :data="allsysList.filter(data => !search 
    || data.HostName.toLowerCase().includes(search.toLowerCase())
    || data.IPadd.toLowerCase().includes(search.toLowerCase())
    || data.HostType.toLowerCase().includes(search.toLowerCase())
    || data.Description.toLowerCase().includes(search.toLowerCase())
    || data.StatusInfo.toLowerCase().includes(search.toLowerCase()))"
    :span-method="arraySpanMethod"
    v-loading="loading"
    height="390"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading">
      <el-table-column prop="HostId" label="ID" width="60"></el-table-column>
      <el-table-column prop="HostType" label="Host Type"></el-table-column>
      <el-table-column prop="HostName" label="Host Name"></el-table-column>
      <el-table-column prop="IPadd" label="IP Address"></el-table-column>
      <el-table-column prop="StatusInfo" label="Status"  width="75"></el-table-column>
      <el-table-column prop="Description" label="Description" width="280">
      </el-table-column>
      <el-table-column align="right" width="160">
        <template #header>
          <el-input v-model="search" size="mini" placeholder="Filter keywords"/>
        </template>
        <template #default="scope">
          <el-button size="mini"
            @click="handleEdit(scope.$index, scope.row)">View</el-button>
          <el-button size="mini"
            @click="toHostEdit(scope.row)">Edit</el-button>
          <el-button size="mini" type="danger"
            @click="handleDelete(scope.row.modelId)">Delete</el-button>
        </template>
      </el-table-column>
      <el-table-column align="left" width="65">
        <template #header>
          <el-button size="mini" type="success"
            @click="()=> this.$router.push('/allsystems/update')" >Add</el-button>
        </template>
      </el-table-column>
    </el-table>
      <basic-pagination :total="pageTotal" @pageChange="pageChange"></basic-pagination>
  </div>
</template>

<script>
import BasicPagination from "@/components/pagination/BasicPagination"
import { getSystems, deleteHost } from "@/api/demo.js"

export default {
  name: "Allsystems",
  components: {
    BasicPagination
  },
  data() {
    return {
    pageIndex : 1, // 默认页数
    pageTotal: 1, // 默认总条数
    pageSize : 10, //默认每页显示多少条
    allsysList: [],
    search: ''
    }
  },
  methods: {
    pageChange (item) {//分页相关
        this.pageIndex = item.pageIndex;
        this.pageSize = item.pageLimit;
        this.handleSearch();//改变页码，重新渲染页面
    },
    toHostEdit(row) {
      this.$router.push({
        name: "update",
        params: {
          HostId: row.HostId,
          HostType: row.HostType,
          HostName: row.HostName,
          IPadd: row.IPadd,
          Description: row.Description,
          StatusInfo: row.statusInfo
        }
      });
    },
    handleDelete(modelId) {
      this.$confirm("This operation will delete the data,are you sure?", "Prompt information", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning"
      })
        .then(() => {
          deleteHost(modelId).then(() => {
            this.$message.success("Successfully Deleted");
            this.refresh();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "The delete operation has been cancelled."
          });
        });
    },
    //表格单元格合并
    arraySpanMethod({ columnIndex }) {
      if (columnIndex === 6) {
        return [1, 2];
      }
    },
  },
  mounted() {
    getSystems().then(response => {
      this.allsysList = response.content;
      this.pageTotal=response.total;//分页相关
    });
  },
};
</script>
