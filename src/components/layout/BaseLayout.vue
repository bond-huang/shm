<template>
  <div class="common-layout">
    <Header/>
    <div class="main-wrapper">
      <Aside/>
      <div class="content-wrapper">
        <Content/>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header/Header.vue'
import Aside from '@/components/Aside/Aside.vue'
import Content from '@/components/Main/Content.vue'

export default {
  name: 'BaseLayout',
  components: {
    Header,
    Aside,
    Content
  }
}
</script>

<style>
  .common-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* 主包装器 */
  .main-wrapper {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* 内容包装器 - 滚动容器 */
  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-width: 0;
    background-color: #f0f2f5;
    transition: width 0.25s ease;
  }
</style>