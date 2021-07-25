<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts"
import { ref, defineComponent } from "vue"

export default defineComponent({
  name: "AdapterPerf",
  components: {
    VChart
  },
  provide: {
    [THEME_KEY]: ""
  },
  setup () {
    const option = ref({
      title: {
      text: 'Usage Rate(%)'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['vscsi0', 'vscsi1', 'fscsi0', 'fscsi1']
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
      series: [
        {
            name: 'vscsi0',
            type: 'line',
            smooth: true,
            data: [2.1,2.9,3.1,3.5,3.8,3.5,3.1,2.9,2.7,2.9,2.3,2.1,
            2.5,2.8,3.1,2.1,2.3,2.1,2.2,2.5,2.1,2.7,2.3,2.9]
        },
        {
            name: 'vscsi1',
            type: 'line',
            smooth: true,
            data: [1.2,1.5,2.9,2.1,3.2,2.9,2.5,1.9,2.4,2.9,2.7,2.9,
            3.1,3.3,3.7,3.3,2.1,2.4,3.1,2.1,2.4,2.1,2.2,2.6]
        },
        {
            name: 'fscsi0',
            type: 'line',
            smooth: true,
            data: [14.9,18.1,17.8,16.9,18.9,17.5,17.9,16.5,15.9,15.6,14.8,13.9,
            12.6,13.9,14.8,14.9,15.9,16.2,15.9,15.4,15.8,15.9,15.7,14.9]
        },
        {
            name: 'fscsi1',
            type: 'line',
            smooth: true,
            data: [37.5,61.5,62.2,64.3,58.9,55.3,54.4,53.7,55.2,56.9,53.7,52.2,
            53.2,55.5,57.3,59.1,61.7,60.9,61.1,63.3,62.2,63.1,61.9,61.2]
        },
      ]
    });
    return { option };
  }
});
</script>

<style scoped>
.chart {
  height: 300px;
  width: 1000px;
}
</style>