<template>
  <div v-for="(item, index) in children" :key="index">
    <el-submenu v-if="item.menuType == 1" :index="item.menuId">
      <template #title>{{item.menuName}}</template>
        <ChildrenMenu  v-bind:children="item.children" />
      <el-menu-item v-if="item.menuType == 2" :index="item.menuId" @click="openPage(item.path)">
        {{item.menuName}}
      </el-menu-item>
    </el-submenu>
  </div>
</template>

<script>
export default {
  props: ["children"],
  name: 'ChildrenMenu',
  methods: {
    openPage(url) {
      this.$router.push(url);
    }
  }
}
</script>