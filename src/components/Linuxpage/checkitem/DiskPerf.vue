<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent} from "vue"

export default defineComponent({
  name: "LinuxDiskPerf",
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
                name: 'sda',
                type: 'line',
                smooth: true,
                data: [3.2,4.5,5.8,6.2,5.1,4.2,3.8,4.8,8.5,12.1,10.5,9.2,
                8.8,10.2,11.5,9.8,7.5,6.2,5.1,4.5,3.8,3.5,3.2,3.1]
            },
            {
                name: 'sdb',
                type: 'line',
                smooth: true,
                data: [1.5,2.1,3.2,3.8,2.9,2.2,1.8,2.5,5.2,7.8,6.5,5.8,
                5.2,6.1,7.2,6.5,4.8,3.8,2.9,2.5,2.1,1.8,1.5,1.4]
            },
            {
                name: 'dm-0',
                type: 'line',
                smooth: true,
                data: [2.8,3.9,5.2,5.5,4.5,3.8,3.2,4.2,7.5,10.8,9.2,8.1,
                7.5,9.1,10.2,8.5,6.5,5.5,4.5,3.9,3.2,2.9,2.8,2.5]
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
        data: ['sda', 'sdb', 'dm-0']
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
