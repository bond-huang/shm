<template>
  <div align="right">
    <el-button size="mini" type="success"
      @click="()=> this.$router.push()">ReCheck</el-button>
    <el-button size="mini" type="primary"
      @click="()=> this.$router.push()">View Output</el-button>
  </div>
    &nbsp;
  <el-table
    :data="rootInfo"
    border
    :span-method="arraySpanMethod"
    style="width: 100%">
    <el-table-column label="Check Item" prop="item"></el-table-column>
    <el-table-column label="Description" prop="description"></el-table-column>
    <el-table-column label="Result" prop="result"></el-table-column>
    <el-table-column label="Mark" prop="result"></el-table-column>
  </el-table>
</template>

<script>
  export default {
    name: "Rootvgck",
    data() {
      return {
        rootInfo: [{
          item: 'Rootvg State',
          description: 'Must be active',
          result: 'active',
          mark:''
        }, {
          item: 'Rootvg Disk Member',
          description: 'N/A',
          result: 'hdisk3/hdisk4',
        }, {
          item: 'Disk Member State',
          description: 'Must be active',
          result: 'active',
        },{
          item: 'Total PPs',
          description: 'N/A',
          result: '1534',
        },{
          item: 'Free PPs',
          description: 'Pay attention if less',
          result: '674',
        },{
          item: 'PP Size',
          description: 'N/A',
          result: '128MB',
        },{
          item: 'Rootvg disks all on bootlist?',
          description: 'Please check and add if No',
          result: 'Yes',
        },{
          item: 'Rootvg have a mirror?',
          description: 'Rootvg mirror except lg_dumplv',
          result: 'Yes',
        },{
          item: 'All LVs are syncd?',
          description: 'All must be syncd',
          result: 'Yes',
        },{
          item: 'Primary dump LV',
          description: 'Please set if not lg_dumplv',
          result: '/dev/lg_dumplv',
        },{
          item: 'Forced copy flag',
          description: 'Please set if not true',
          result: 'TRUE',
        },{
          item: 'Always allow dump',
          description: 'Please set if not true',
          result: 'TRUE',
        },{
          item: 'Dump compression',
          description: 'Please set if OFF',
          result: 'ON',
        },{
          item: 'Rootvg last backup time',
          description: 'Image.data cannot be found',
          result: 'N/A',
        },
        ],
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
      handleChange(val) {
        console.log(val);
      }
    },
  }
</script>