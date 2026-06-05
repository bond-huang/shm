<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent} from "vue"

export default defineComponent({
  name: "LinuxNetworkPerf",
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
                name: 'eth0',
                type: 'line',
                smooth: true,
                data: [3.5,5.2,6.8,7.5,6.2,5.1,4.2,5.8,12.5,18.2,15.5,13.8,
                12.5,15.8,18.5,15.2,10.8,8.5,6.2,5.5,4.8,4.2,3.8,3.5]
            },
            {
                name: 'eth1',
                type: 'line',
                smooth: true,
                data: [1.2,1.8,2.5,2.8,2.2,1.8,1.5,2.1,5.2,8.5,7.2,6.5,
                5.8,7.2,8.5,7.2,4.8,3.5,2.5,2.1,1.8,1.5,1.2,1.1]
            },
            {
                name: 'lo',
                type: 'line',
                smooth: true,
                data: [0.5,0.8,1.2,1.5,1.1,0.8,0.6,0.9,2.5,3.8,3.2,2.8,
                2.5,3.2,3.8,3.2,2.1,1.5,1.1,0.9,0.8,0.6,0.5,0.5]
            },
        ]
    const option = ref({
      title: {
      text: 'Network Traffic(%)'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['eth0', 'eth1', 'lo']
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
