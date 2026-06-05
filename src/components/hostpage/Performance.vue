<template>
  <el-row>
    <el-col :span="22" :offset="1">
      <h4>System Performance Data</h4>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Processor Performance" name="1">
          <ProcessorPerf :hostType="host.HostType"></ProcessorPerf>
        </el-collapse-item>
        <el-collapse-item title="Memory Performance" name="2">
          <MemoryPerf :hostType="host.HostType"></MemoryPerf>
        </el-collapse-item>
        <el-collapse-item title="Disk Performance" name="3">
          <DiskPerf :hostType="host.HostType"></DiskPerf>
        </el-collapse-item>
        <el-collapse-item :title="networkTitle" name="4">
          <NetworkPerf :hostType="host.HostType"></NetworkPerf>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>

<script>
import ProcessorPerf from "@/components/hostpage/checkitem/ProcessorPerf"
import MemoryPerf from "@/components/hostpage/checkitem/MemoryPerf"
import DiskPerf from "@/components/hostpage/checkitem/DiskPerf"
import NetworkPerf from "@/components/hostpage/checkitem/NetworkPerf"

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { TitleComponent, ToolboxComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";

use([CanvasRenderer, GridComponent, LineChart, TitleComponent, TooltipComponent, ToolboxComponent, LegendComponent]);

export default {
  name: "HostPerformance",
  components: { ProcessorPerf, MemoryPerf, DiskPerf, NetworkPerf },
  props: {
    host: { type: Object, default: () => ({}) }
  },
  computed: {
    networkTitle() {
      return this.host.HostType === 'AIX' ? 'Adapter Performance' : 'Network Performance';
    }
  },
  data() {
    return {
      activeNames: ['1']
    }
  }
}
</script>
