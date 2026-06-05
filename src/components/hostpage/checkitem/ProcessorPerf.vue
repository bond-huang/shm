<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent } from "vue"

export default defineComponent({
  name: "ProcessorPerf",
  components: { VChart },
  provide: { [THEME_KEY]: "" },
  props: {
    hostType: { type: String, default: 'Linux' }
  },
  setup(props) {
    const serieslist = props.hostType === 'AIX'
      ? [
          { name: 'user', type: 'line', smooth: true, data: [3,28,32,34,12,10,11,9,8,18,14,12,13,10,13,9,23,21,16,14,13,15,17,14] },
          { name: 'sys', type: 'line', smooth: true, data: [8,14,18,16,10,9,9,6,7,13,15,22,18,19,23,29,33,31,21,17,14,19,11,9] },
          { name: 'idle', type: 'line', smooth: true, data: [89,58,50,50,78,81,80,85,85,69,71,66,69,71,64,62,44,48,63,69,73,66,72,77] },
          { name: 'iowait', type: 'line', smooth: true, data: [1,7,8,6,8,5,6,3,2,3,1,1,0,3,0,2,1,3,7,4,1,4,2,1] },
          { name: 'entc', type: 'line', smooth: true, data: [11,42,50,50,22,19,20,15,15,31,29,34,31,29,36,38,56,52,37,31,27,34,28,23] }
        ]
      : [
          { name: 'user', type: 'line', smooth: true, data: [5,12,18,22,15,10,8,14,28,35,32,30,28,32,35,30,25,22,18,15,12,10,8,6] },
          { name: 'system', type: 'line', smooth: true, data: [3,5,8,10,7,5,4,6,12,15,14,13,12,14,15,13,10,8,7,6,5,4,3,3] },
          { name: 'idle', type: 'line', smooth: true, data: [90,80,70,64,75,82,86,77,55,45,50,53,56,50,45,53,60,66,72,76,80,83,87,89] },
          { name: 'iowait', type: 'line', smooth: true, data: [2,3,4,4,3,3,2,3,5,5,4,4,4,4,5,4,5,4,3,3,3,3,2,2] }
        ]

    const legendData = serieslist.map(s => s.name)

    const option = ref({
      title: { text: 'Usage Rate(%)' },
      tooltip: { trigger: 'axis' },
      legend: { data: legendData },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      toolbox: { feature: { saveAsImage: {} } },
      xAxis: {
        type: 'category', boundaryGap: false,
        data: ['01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00']
      },
      yAxis: { type: 'value' },
      series: serieslist
    })
    return { option }
  }
})
</script>

<style scoped>
.chart { height: 300px; width: 1060px; }
</style>
