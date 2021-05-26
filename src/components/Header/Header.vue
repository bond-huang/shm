<template>
  <div class="shm-header">
    <el-row style="height: 60px">
      <el-col :span="6">
        <Logo/>
      </el-col>
      <el-col :span="12">
        <MainMenu/>
      </el-col>
      <el-col :span="6">
        <Tools/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Logo from '@/components/Header/Logo.vue'
import MainMenu from '@/components/Header/MainMenu.vue'
import Tools from '@/components/Header/Tools.vue'

export default {
  name: 'Header',
  components: {
    Logo,
    MainMenu,
    Tools
  }
}
</script>

<style scoped>
.shm-header {
  height: 50px;
  width: 100%;
  padding: 2px 0px;
  line-height: 50px;
  background-color:#337ab7;
}
</style>