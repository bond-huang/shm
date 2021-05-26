<template>
<div class="common-layout">
  <el-container direction="vertical">
        <Header/>
    <el-container>
       <Aside/>
      <el-container style="height: 550px; border: 1px solid #eee">
        <el-main><Content/></el-main>
      </el-container>
    </el-container>
  </el-container>
</div>
</template>

<script>
import Header from '@/components/Header/Header.vue'
import Aside from '@/components/Aside/Aside.vue'
import Content from '@/components/Main/Content.vue'

export default {
  name: 'Home',
  components: {
    Header,
    Aside,
    Content
  }
}
</script>

<style>
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
  }
  body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>