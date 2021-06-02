<template>
  <div v-for="(item, index) in menuData" :key="index">
    <el-submenu :index="item.menuId">
      <template #title>{{ item.menuName }}</template>
        <div v-for="(item, index) in item.children" :key="index">
          <el-menu-item v-if="item.menuType == 2" :index="item.menuId" @click="openPage(item.path)">
            {{ item.menuName }}
          </el-menu-item>
        </div>
    </el-submenu>
  </div>
</template>

<script>
export default {
  props: ["menuData"],
  name: 'ChildrenMenu',
  methods: {
    openPage(url) {
      this.$router.push(url);
    }
  }
}
</script>