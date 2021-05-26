<template>
  <div>
    <el-table 
    :data="tableData.filter(data => !search 
    || data.Hostname.toLowerCase().includes(search.toLowerCase())
    || data.IPadd.toLowerCase().includes(search.toLowerCase())
    || data.Hosttype.toLowerCase().includes(search.toLowerCase())
    || data.Description.toLowerCase().includes(search.toLowerCase()))"
    :span-method="arraySpanMethod"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading">
      <el-table-column prop="Hosttype" label="Host Type"></el-table-column>
      <el-table-column prop="Hostname" label="Host Name"></el-table-column>
      <el-table-column prop="IPadd" label="IP Address"></el-table-column>
      <el-table-column prop="Description" label="Description" width="300">
      </el-table-column>
      <el-table-column align="right" width="180">
        <template #header>
          <el-input v-model="search" size="mini" placeholder="Filter keywords"/>
        </template>
        <template #default="scope">
          <el-button size="mini"
            @click="handleEdit(scope.$index, scope.row)">View</el-button>
          <el-button size="mini"
            @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
          <el-button size="mini" type="danger"
            @click="handleDeleteModel(scope.row.modelId)">Delete</el-button>
        </template>
      </el-table-column>
      <el-table-column align="right" width="70">
        <template #header>
          <el-button size="mini" type="success"
            @click="handleDelete(scope.$index, scope.row)" >Add</el-button>
        </template>
      </el-table-column>
    </el-table>
      <basic-pagination :total="pageTotal" @pageChange="pageChange"></basic-pagination>
  </div>
</template>

<script>
import BasicPagination from "@/components/pagination/BasicPagination"
import { deleteModel } from "@/api/demo.js"

export default {
  name: "Allsystems",
  components: {
    BasicPagination
  },
  data() {
    const item = {
    Hosttype: 'AIX',
    Hostname: 'aix7236test',
    IPadd: '192.168.100.100',
    Description: 'IBM AIX test system IBM AIX test system'
    };
    return {
    pageIndex : 1, // 默认页数
    pageTotal: 1, // 默认总条数
    pageSize : 10, //默认每页显示多少条
    tableData: Array(20).fill(item),
    search: ''
    }
  },
  methods: {
    pageChange (item) {//分页相关
        this.pageIndex = item.pageIndex;
        this.pageSize = item.pageLimit;
        this.handleSearch();//改变页码，重新渲染页面
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDeleteModel(modelId) {
      this.$confirm("This operation will delete the data,are you sure?", "Prompt information", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning"
      })
        .then(() => {
          deleteModel(modelId).then(() => {
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
      if (columnIndex === 4) {
        return [1, 2];
      }
    },
  },
};
</script>
