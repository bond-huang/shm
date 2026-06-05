<template>
  <el-row>
    <el-col :span="22" :offset="1">
      <h4>System Performance Data</h4>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="Processor Performance" name="1">
            <ProcessorPerf></ProcessorPerf>
        </el-collapse-item>
        <el-collapse-item title="Memory Performance" name="2">
            <MemoryPerf></MemoryPerf>
        </el-collapse-item>
        <el-collapse-item title="Disk Performance" name="3">
            <DiskPerf></DiskPerf>
        </el-collapse-item>
        <el-collapse-item title="Network Performance" name="4">
            <NetworkPerf></NetworkPerf>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>

<script>
import ProcessorPerf from "@/components/Linuxpage/checkitem/ProcessorPerf"
import MemoryPerf from "@/components/Linuxpage/checkitem/MemoryPerf"
import DiskPerf from "@/components/Linuxpage/checkitem/DiskPerf"
import NetworkPerf from "@/components/Linuxpage/checkitem/NetworkPerf"

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";

import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";

use([
  CanvasRenderer,
  GridComponent,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent
]);

export default {
    name: "LinuxPerformance",
    components: {
    ProcessorPerf,
    MemoryPerf,
    DiskPerf,
    NetworkPerf,
  },
    data() {
      return {
        search: '',
        activeNames: ['1']
      }
    },
    methods: {
      handleChange(val) {
        console.log(val);
      }
    },
  }
</script>
