<template>
  <el-row>
    <el-col :span="22" :offset="1">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h4 style="margin: 0;">System Performance Data</h4>
        <el-button size="small" type="primary" :loading="loading" @click="refreshAll" v-if="host.HostId">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </el-button>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="Processor Performance" name="1">
          <ProcessorPerf ref="cpu" :hostType="host.HostType" :hostId="host.HostId"></ProcessorPerf>
        </el-collapse-item>
        <el-collapse-item title="Memory Performance" name="2">
          <MemoryPerf ref="mem" :hostType="host.HostType" :hostId="host.HostId"></MemoryPerf>
        </el-collapse-item>
        <el-collapse-item title="Disk Performance" name="3">
          <DiskPerf ref="disk" :hostType="host.HostType" :hostId="host.HostId"></DiskPerf>
        </el-collapse-item>
        <el-collapse-item :title="networkTitle" name="4">
          <NetworkPerf ref="net" :hostType="host.HostType" :hostId="host.HostId"></NetworkPerf>
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
  data() {
    return {
      activeNames: ['1'],
      loading: false
    }
  },
  computed: {
    networkTitle() {
      return this.host.HostType === 'AIX' ? 'Adapter Performance' : 'Network Performance';
    }
  },
  methods: {
    async refreshAll() {
      this.loading = true;
      const refs = ['cpu', 'mem', 'disk', 'net'];
      await Promise.all(refs.map(r => this.$refs[r]?.fetchData?.()));
      this.loading = false;
    }
  }
}
</script>
