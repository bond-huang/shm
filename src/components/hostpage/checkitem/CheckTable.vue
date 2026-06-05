<template>
  <div>
    <div align="right" style="margin-bottom: 10px;">
      <el-button size="mini" type="success">ReCheck</el-button>
      <el-button size="mini" type="primary">View Output</el-button>
    </div>
    <el-table :data="checkData" border style="width: 100%">
      <el-table-column label="Check Item" prop="item"></el-table-column>
      <el-table-column label="Description" prop="description"></el-table-column>
      <el-table-column label="Result" prop="result"></el-table-column>
      <el-table-column label="Mark" prop="mark"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "CheckTable",
  props: {
    hostType: { type: String, default: 'Linux' }
  },
  computed: {
    checkData() {
      if (this.hostType === 'AIX') {
        return [
          { item: 'Rootvg State', description: 'Must be active', result: 'active', mark: '' },
          { item: 'Rootvg Disk Member', description: 'N/A', result: 'hdisk3/hdisk4', mark: '' },
          { item: 'Disk Member State', description: 'Must be active', result: 'active', mark: '' },
          { item: 'Total PPs', description: 'N/A', result: '1534', mark: '' },
          { item: 'Free PPs', description: 'Pay attention if less', result: '674', mark: '' },
          { item: 'PP Size', description: 'N/A', result: '128MB', mark: '' },
          { item: 'Rootvg disks all on bootlist?', description: 'Please check and add if No', result: 'Yes', mark: '' },
          { item: 'Rootvg have a mirror?', description: 'Rootvg mirror except lg_dumplv', result: 'Yes', mark: '' },
          { item: 'All LVs are syncd?', description: 'All must be syncd', result: 'Yes', mark: '' },
          { item: 'Primary dump LV', description: 'Please set if not lg_dumplv', result: '/dev/lg_dumplv', mark: '' },
          { item: 'Dump compression', description: 'Please set if OFF', result: 'ON', mark: '' },
          { item: 'Rootvg last backup time', description: 'Image.data cannot be found', result: 'N/A', mark: '' }
        ];
      } else {
        return [
          { item: 'Root Filesystem Usage', description: 'Should be below 80%', result: '71%', mark: '' },
          { item: '/boot Usage', description: 'Should be below 80%', result: '45%', mark: '' },
          { item: 'LVM VG Status', description: 'All VGs should be active', result: 'active', mark: '' },
          { item: 'VG rhel Total PE', description: 'N/A', result: '5119', mark: '' },
          { item: 'VG rhel Free PE', description: 'Pay attention if less', result: '1280', mark: '' },
          { item: 'PE Size', description: 'N/A', result: '4.00MB', mark: '' },
          { item: 'LV root Status', description: 'Must be active', result: 'active', mark: '' },
          { item: 'Disk sda Health', description: 'SMART status should be PASSED', result: 'PASSED', mark: '' },
          { item: 'Filesystem Errors', description: 'No errors in dmesg', result: 'None', mark: '' },
          { item: 'Inode Usage (/)', description: 'Should be below 80%', result: '32%', mark: '' },
          { item: 'Last fsck Time', description: 'Should be within 180 days', result: '2024-01-10', mark: '' }
        ];
      }
    }
  }
}
</script>
