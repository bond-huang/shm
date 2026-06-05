<template>
  <div align="right">
    <el-button size="mini" type="success"
      @click="()=> this.$router.push()">ReCheck</el-button>
    <el-button size="mini" type="primary"
      @click="()=> this.$router.push()">View Output</el-button>
  </div>
    &nbsp;
  <el-table
    :data="diskInfo"
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
    name: "DiskCheck",
    data() {
      return {
        diskInfo: [{
          item: 'Root Filesystem Usage',
          description: 'Should be below 80%',
          result: '71%',
          mark: ''
        }, {
          item: '/boot Usage',
          description: 'Should be below 80%',
          result: '45%',
        }, {
          item: 'LVM VG Status',
          description: 'All VGs should be active',
          result: 'active',
        }, {
          item: 'VG rhel Total PE',
          description: 'N/A',
          result: '5119',
        }, {
          item: 'VG rhel Free PE',
          description: 'Pay attention if less',
          result: '1280',
        }, {
          item: 'PE Size',
          description: 'N/A',
          result: '4.00MB',
        }, {
          item: 'LV root Status',
          description: 'Must be active',
          result: 'active',
        }, {
          item: 'LV swap Status',
          description: 'Must be active',
          result: 'active',
        }, {
          item: 'Disk sda Health',
          description: 'SMART status should be PASSED',
          result: 'PASSED',
        }, {
          item: 'Disk sdb Health',
          description: 'SMART status should be PASSED',
          result: 'PASSED',
        }, {
          item: 'Filesystem Errors',
          description: 'No errors in dmesg',
          result: 'None',
        }, {
          item: 'Inode Usage (/)',
          description: 'Should be below 80%',
          result: '32%',
        }, {
          item: 'Last fsck Time',
          description: 'Should be within 180 days',
          result: '2024-01-10',
        }, {
          item: 'Multipath Status',
          description: 'All paths should be active',
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
