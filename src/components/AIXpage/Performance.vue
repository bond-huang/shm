<template>
  <el-row>
    <el-col :span="20" :offset="2">
      <h4>System Processor Memory and Didks Performance</h4>
      <el-collapse v-model="activeNames" @change="handleChange">
        <el-collapse-item title="Processor Performance" name="1">
            <ProcessorPerf></ProcessorPerf>
        </el-collapse-item>
        <el-collapse-item title="Memory Performance" name="2">
            <MemoryPerf></MemoryPerf>
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>

<script>
import ProcessorPerf from "@/components/AIXpage/checkitem/ProcessorPerf"
import MemoryPerf from "@/components/AIXpage/checkitem/MemoryPerf"

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
    name: "Performance",
    components: {
    ProcessorPerf,
    MemoryPerf,
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