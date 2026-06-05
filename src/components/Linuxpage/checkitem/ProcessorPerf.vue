<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent} from "vue"

export default defineComponent({
  name: "LinuxProcessorPerf",
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
                name: 'user',
                type: 'line',
                smooth: true,
                data: [5,12,18,22,15,10,8,14,28,35,32,30,
                28,32,35,30,25,22,18,15,12,10,8,6]
            },
            {
                name: 'system',
                type: 'line',
                smooth: true,
                data: [3,5,8,10,7,5,4,6,12,15,14,13,
                12,14,15,13,10,8,7,6,5,4,3,3]
            },
            {
                name: 'idle',
                type: 'line',
                smooth: true,
                data: [90,80,70,64,75,82,86,77,55,45,50,53,
                56,50,45,53,60,66,72,76,80,83,87,89]
            },
            {
                name: 'iowait',
                type: 'line',
                smooth: true,
                data: [2,3,4,4,3,3,2,3,5,5,4,4,
                4,4,5,4,5,4,3,3,3,3,2,2]
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
        data: ['user', 'system', 'idle', 'iowait']
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
  width: 1060px;
}
</style>
