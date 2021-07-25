<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "DiskPerf",
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
        data: ['hdisk0', 'hdisk1', 'hdisk2', 'hdisk3']
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
            name: 'hdisk0',
            type: 'line',
            smooth: true,
            data: [2.1,2.9,3.1,3.5,3.8,3.5,3.1,2.9,2.7,2.9,2.3,2.1,
            2.5,2.8,3.1,2.1,2.3,2.1,2.2,2.5,2.1,2.7,2.3,2.9]
        },
        {
            name: 'hdisk1',
            type: 'line',
            smooth: true,
            data: [1.2,1.5,2.9,2.1,3.2,2.9,2.5,1.9,2.4,2.9,2.7,2.9,
            3.1,3.3,3.7,3.3,2.1,2.4,3.1,2.1,2.4,2.1,2.2,2.6]
        },
        {
            name: 'hdisk2',
            type: 'line',
            smooth: true,
            data: [1.9,1.9,1.8,1.9,1.9,1.5,1.9,1.9,1.9,1.6,1.8,1.9,
            1.6,1.9,1.8,1.9,1.9,1.2,1.9,1.9,1.8,1.9,1.7,1.9]
        },
        {
            name: 'hdisk3',
            type: 'line',
            smooth: true,
            data: [37.5,61.5,67.2,66.3,55.9,51.3,52.4,53.7,55.2,56.9,53.7,52.2,
            53.2,55.5,57.3,59.1,61.7,61.9,63.1,65.3,66.2,68.1,66.9,63.2]
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