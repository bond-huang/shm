<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent} from "vue"

export default defineComponent({
  name: "LinuxMemoryPerf",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: ""
  },
  setup () {
    var serieslist =
    [
            {
                name: 'MemUsed',
                type: 'line',
                smooth: true,
                data: [42.5,55.3,62.1,65.8,58.2,52.6,48.3,51.7,68.4,72.1,70.5,68.2,
                65.8,68.5,71.2,69.8,66.4,63.2,58.7,55.3,52.1,49.8,46.5,44.2]
            },
            {
                name: 'SwapUsed',
                type: 'line',
                smooth: true,
                data: [2.1,2.1,2.3,2.5,2.4,2.2,2.1,2.1,3.5,4.2,4.0,3.8,
                3.5,3.8,4.1,3.9,3.5,3.2,2.8,2.5,2.3,2.2,2.1,2.1]
            },
        ]
    const option = ref({
      title: {
      text: 'Usage Rate(%)'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['MemUsed', 'SwapUsed']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
            saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['01:00','02:00','03:00','04:00','05:00',
        '06:00','07:00','08:00','09:00','10:00','11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00', '22:00', '23:00', '00:00',]
      },
      yAxis: {
        type: 'value'
      },
      series: serieslist
    });
    return { option };
  },
});
</script>

<style scoped>
.chart {
  height: 300px;
  width: 1000px;
}
</style>
