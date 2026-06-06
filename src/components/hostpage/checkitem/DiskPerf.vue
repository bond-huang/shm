<template>
  <div>
    <div v-if="loading" style="text-align: center; padding: 40px;">
      <i class="el-icon-loading" style="font-size: 24px; color: #409eff;"></i>
      <p style="color: #909399; margin-top: 8px;">Loading disk data...</p>
    </div>
    <v-chart v-else class="chart" :option="option" autoresize />
  </div>
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { defineComponent } from "vue"
import { getPerfHistory } from "@/api/perf.js"

export default defineComponent({
  name: "DiskPerf",
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
        return {
          title: { text: 'Usage Rate(%)' },
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
            { name: 'hdisk0', type: 'line', smooth: true, data: [2.1,2.9,3.1,3.5,3.8,3.5,3.1,2.9,2.7,2.9,2.3,2.1,2.5,2.8,3.1,2.1,2.3,2.1,2.2,2.5,2.1,2.7,2.3,2.9] },
            { name: 'hdisk1', type: 'line', smooth: true, data: [1.2,1.5,2.9,2.1,3.2,2.9,2.5,1.9,2.4,2.9,2.7,2.9,3.1,3.3,3.7,3.3,2.1,2.4,3.1,2.1,2.4,2.1,2.2,2.6] },
            { name: 'hdisk2', type: 'line', smooth: true, data: [1.9,1.9,1.8,1.9,1.9,1.5,1.9,1.9,1.9,1.6,1.8,1.9,1.6,1.9,1.8,1.9,1.9,1.2,1.9,1.9,1.8,1.9,1.7,1.9] },
            { name: 'hdisk3', type: 'line', smooth: true, data: [37.5,61.5,67.2,66.3,55.9,51.3,52.4,53.7,55.2,56.9,53.7,52.2,53.2,55.5,57.3,59.1,61.7,61.9,63.1,65.3,66.2,68.1,66.9,63.2] }
          ]
        : [
            { name: 'sda', type: 'line', smooth: true, data: [3.2,4.5,5.8,6.2,5.1,4.2,3.8,4.8,8.5,12.1,10.5,9.2,8.8,10.2,11.5,9.8,7.5,6.2,5.1,4.5,3.8,3.5,3.2,3.1] },
            { name: 'sdb', type: 'line', smooth: true, data: [1.5,2.1,3.2,3.8,2.9,2.2,1.8,2.5,5.2,7.8,6.5,5.8,5.2,6.1,7.2,6.5,4.8,3.8,2.9,2.5,2.1,1.8,1.5,1.4] },
            { name: 'dm-0', type: 'line', smooth: true, data: [2.8,3.9,5.2,5.5,4.5,3.8,3.2,4.2,7.5,10.8,9.2,8.1,7.5,9.1,10.2,8.5,6.5,5.5,4.5,3.9,3.2,2.9,2.8,2.5] }
          ];

      return {
        title: { text: 'Usage Rate(%)' },
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
        if (res && res.disk) {
          this.historyData = res.disk;
        }
      } catch (e) {
        console.error('Fetch disk history failed:', e);
      }
      this.loading = false;
    }
  }
})
</script>

<style scoped>
.chart { height: 300px; width: 100%; }
</style>
