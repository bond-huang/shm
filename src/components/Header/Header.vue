<template>
  <div class="shm-header">
    <div class="header-inner">
      <Logo/>
      <MainMenu/>
      <Tools/>
    </div>
    <div class="header-glow"></div>
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
  position: relative;
  width: 100%;
  height: 56px;
  background: linear-gradient(180deg, rgba(14, 18, 42, 0.98), rgba(10, 14, 39, 0.95));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 198, 255, 0.1);
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 198, 255, 0.3), rgba(0, 114, 255, 0.3), transparent);
}
</style>
