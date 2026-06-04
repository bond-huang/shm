<template>
  <div v-for="(item, index) in menuData" :key="index">
    <el-submenu :index="item.menuId" popper-class="aside-submenu-popup">
      <template #title>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="submenu-icon">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
        </svg>
        <span>{{ item.menuName }}</span>
      </template>
        <div v-for="(item, index) in item.children" :key="index">
          <el-menu-item v-if="item.menuType == 2" :index="item.menuId" @click="openPage(item.path)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="submenu-icon-sm">
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <span>{{ item.menuName }}</span>
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

<style scoped>
.submenu-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.submenu-icon-sm {
  width: 12px;
  height: 12px;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>

<style>
/* 子菜单项 - 和主菜单左对齐 */
.shm-aside .el-submenu .el-menu-item {
  padding-left: 29px !important;
  font-size: 12px;
  height: 38px;
  line-height: 38px;
  color: rgba(255, 255, 255, 0.75) !important;
}

.shm-aside .el-submenu .el-menu-item:hover {
  color: #fff !important;
}

.shm-aside .el-menu--collapse .el-submenu .el-menu-item {
  padding-left: 0 !important;
  text-align: center;
}
</style>
