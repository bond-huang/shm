<template>
  <div>
    <div v-if="loading" style="text-align: center; padding: 40px;">
      <i class="el-icon-loading" style="font-size: 24px; color: #409eff;"></i>
      <p style="color: #909399; margin-top: 8px;">Loading network data...</p>
    </div>
    <v-chart v-else class="chart" :option="option" autoresize />
  </div>
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { defineComponent } from "vue"
import { getPerfHistory } from "@/api/perf.js"

export default defineComponent({
  name: "NetworkPerf",
  components: { VChart },
  provide: { [THEME_KEY]: "" },
  props: {
    hostType: { type: String, default: 'Linux' },
    hostId: { type: [Number, String], default: null }
  },
  data() {
    return {
      loading: false,
      historyData: null
    }
  },
  computed: {
    option() {
      if (this.historyData && this.historyData.series.length > 0) {
        const titleText = this.hostType === 'AIX' ? 'Adapter Traffic(MB)' : 'Network Traffic(MB)';
        return {
          title: { text: titleText },
          tooltip: { trigger: 'axis' },
          legend: { data: this.historyData.series.map(s => s.name) },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          toolbox: { feature: { saveAsImage: {} } },
          xAxis: { type: 'category', boundaryGap: false, data: this.historyData.times },
          yAxis: { type: 'value' },
          series: this.historyData.series
        }
      }

      const serieslist = this.hostType === 'AIX'
        ? [
            { name: 'vscsi0', type: 'line', smooth: true, data: [2.1,2.9,3.1,3.5,3.8,3.5,3.1,2.9,2.7,2.9,2.3,2.1,2.5,2.8,3.1,2.1,2.3,2.1,2.2,2.5,2.1,2.7,2.3,2.9] },
            { name: 'vscsi1', type: 'line', smooth: true, data: [1.2,1.5,2.9,2.1,3.2,2.9,2.5,1.9,2.4,2.9,2.7,2.9,3.1,3.3,3.7,3.3,2.1,2.4,3.1,2.1,2.4,2.1,2.2,2.6] },
            { name: 'fscsi0', type: 'line', smooth: true, data: [14.9,18.1,17.8,16.9,18.9,17.5,17.9,16.5,15.9,15.6,14.8,13.9,12.6,13.9,14.8,14.9,15.9,16.2,15.9,15.4,15.8,15.9,15.7,14.9] },
            { name: 'fscsi1', type: 'line', smooth: true, data: [37.5,61.5,62.2,64.3,58.9,55.3,54.4,53.7,55.2,56.9,53.7,52.2,53.2,55.5,57.3,59.1,61.7,60.9,61.1,63.3,62.2,63.1,61.9,61.2] }
          ]
        : [
            { name: 'eth0', type: 'line', smooth: true, data: [3.5,5.2,6.8,7.5,6.2,5.1,4.2,5.8,12.5,18.2,15.5,13.8,12.5,15.8,18.5,15.2,10.8,8.5,6.2,5.5,4.8,4.2,3.8,3.5] },
            { name: 'eth1', type: 'line', smooth: true, data: [1.2,1.8,2.5,2.8,2.2,1.8,1.5,2.1,5.2,8.5,7.2,6.5,5.8,7.2,8.5,7.2,4.8,3.5,2.5,2.1,1.8,1.5,1.2,1.1] },
            { name: 'lo', type: 'line', smooth: true, data: [0.5,0.8,1.2,1.5,1.1,0.8,0.6,0.9,2.5,3.8,3.2,2.8,2.5,3.2,3.8,3.2,2.1,1.5,1.1,0.9,0.8,0.6,0.5,0.5] }
          ];

      const titleText = this.hostType === 'AIX' ? 'Adapter Traffic(%)' : 'Network Traffic(%)';

      return {
        title: { text: titleText },
        tooltip: { trigger: 'axis' },
        legend: { data: serieslist.map(s => s.name) },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        toolbox: { feature: { saveAsImage: {} } },
        xAxis: { type: 'category', boundaryGap: false,
          data: ['01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00']
        },
        yAxis: { type: 'value' },
        series: serieslist
      }
    }
  },
  mounted() {
    if (this.hostId && this.hostType === 'Linux') {
      this.fetchData();
    }
  },
  methods: {
    async fetchData() {
      if (!this.hostId) return;
      this.loading = true;
      try {
        const res = await getPerfHistory(this.hostId);
        if (res && res.network) {
          this.historyData = res.network;
        }
      } catch (e) {
        console.error('Fetch network history failed:', e);
      }
      this.loading = false;
    }
  }
})
</script>

<style scoped>
.chart { height: 300px; width: 100%; }
</style>
