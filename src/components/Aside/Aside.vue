<template>
  <div class="shm-aside" :class="{ collapsed: isCollapse }">
    <div class="aside-toggle" @click="toggleCollapse">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <template v-if="isCollapse">
          <polyline points="9 18 15 12 9 6"/>
        </template>
        <template v-else>
          <polyline points="15 18 9 12 15 6"/>
        </template>
      </svg>
    </div>

    <el-menu
      default-active="1-1-1"
      class="aside-menu"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
      background-color="transparent"
      text-color="rgba(255,255,255,0.85)"
      active-text-color="#00c6ff"
      :collapse-transition="false"
    >
      <el-submenu index="1" popper-class="aside-submenu-popup">
        <template #title>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span class="menu-text">Systems Class</span>
        </template>
        <ChildrenMenu v-bind:menuData="sideMenuList" />
      </el-submenu>

      <el-submenu index="2" popper-class="aside-submenu-popup">
        <template #title>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
          <span class="menu-text">System Admin</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="2-1" @click="openPage('/allsystems')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon-sm">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span class="menu-text">All Systems</span>
          </el-menu-item>
          <el-menu-item index="2-2" @click="openPage('/system-class')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon-sm">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span class="menu-text">System Class</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>

      <el-submenu index="3" popper-class="aside-submenu-popup">
        <template #title>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span class="menu-text">Setting</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="3-1" @click="openPage('/user-settings')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon-sm">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="menu-text">User Setting</span>
          </el-menu-item>
          <el-menu-item index="3-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon-sm">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span class="menu-text">Other Setting</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>

      <el-menu-item index="4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        <span class="menu-text">Document</span>
      </el-menu-item>

      <el-menu-item index="5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span class="menu-text">Help</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getMenu } from '@/api/menu.js';
import ChildrenMenu from '@/components/Aside/ChildrenMenu.vue';

export default {
  name: 'Aside',
  computed: {
    ...mapGetters(["height"])
  },
  components: {
    ChildrenMenu
  },
  data() {
    return {
      sideMenuList: [],
      isCollapse: true
    };
  },
  methods: {
    openPage(url) {
      this.$router.push(url);
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    }
  },
  mounted() {
    getMenu().then(resp => {
      this.sideMenuList = resp
    })
  }
}
</script>

<style scoped>
.shm-aside {
  background: linear-gradient(180deg, rgba(14, 18, 42, 0.98), rgba(10, 14, 39, 0.95));
  border-right: 1px solid rgba(0, 198, 255, 0.08);
  transition: width 0.25s ease;
  position: relative;
  overflow: hidden;
}

.aside-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  cursor: pointer;
  color: rgba(0, 198, 255, 0.6);
  border-bottom: 1px solid rgba(0, 198, 255, 0.06);
  transition: all 0.2s ease;
}

.aside-toggle:hover {
  color: #00c6ff;
  background: rgba(0, 198, 255, 0.06);
}

.aside-toggle svg {
  width: 18px;
  height: 18px;
}

.menu-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
}

.menu-icon-sm {
  width: 15px;
  height: 15px;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>

<!-- Element Plus 菜单暗色覆盖（非 scoped 才能穿透） -->
<style>
.shm-aside .aside-menu {
  border-right: none !important;
  padding: 4px 6px;
}

.shm-aside .aside-menu:not(.el-menu--collapse) {
  width: 180px;
}

/* 所有菜单项统一样式 */
.shm-aside .el-submenu__title,
.shm-aside .el-menu-item {
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 13px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

/* 消除 submenu 标题的默认额外 padding */
.shm-aside .el-submenu__title {
  padding-left: 14px !important;
  padding-right: 10px !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.shm-aside .el-menu-item {
  padding-left: 14px !important;
  padding-right: 10px !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.shm-aside .el-submenu__title:hover,
.shm-aside .el-menu-item:hover {
  background: rgba(0, 198, 255, 0.1) !important;
  color: #fff !important;
}

/* 选中态 */
.shm-aside .el-menu-item.is-active {
  background: rgba(0, 198, 255, 0.15) !important;
  color: #00c6ff !important;
  position: relative;
}

.shm-aside .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #00c6ff;
  border-radius: 0 3px 3px 0;
}

/* 展开的子菜单区域 */
.shm-aside .el-menu--inline {
  background: transparent !important;
  padding: 0;
}

/* 箭头 */
.shm-aside .el-submenu__icon-arrow {
  color: rgba(0, 198, 255, 0.5) !important;
  right: 10px !important;
}

.shm-aside .el-submenu.is-opened .el-submenu__icon-arrow {
  color: #00c6ff !important;
}

.shm-aside .el-menu-item-group__title {
  padding: 0;
}

/* 折叠态居中 */
.shm-aside .el-menu--collapse .el-submenu__title,
.shm-aside .el-menu--collapse .el-menu-item {
  padding: 0 !important;
  justify-content: center;
}

.shm-aside .el-menu--collapse .menu-icon,
.shm-aside .el-menu--collapse .menu-icon-sm {
  margin-right: 0;
}

/* 子菜单弹出层（全局 DOM） */
.aside-submenu-popup {
  background: rgba(16, 20, 44, 0.97) !important;
  border: 1px solid rgba(0, 198, 255, 0.15) !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(16px) !important;
  padding: 4px !important;
}

.aside-submenu-popup .el-menu {
  background: transparent !important;
}

.aside-submenu-popup .el-menu-item {
  color: rgba(255, 255, 255, 0.85) !important;
  height: 40px;
  line-height: 40px;
  border-radius: 6px;
  font-size: 12px;
}

.aside-submenu-popup .el-menu-item:hover {
  background: rgba(0, 198, 255, 0.1) !important;
  color: #fff !important;
}

.aside-submenu-popup .el-menu-item.is-active {
  color: #00c6ff !important;
}

/* Element Plus popper 弹出箭头 */
.aside-submenu-popup .el-popper__arrow::before {
  background: rgba(16, 20, 44, 0.97) !important;
  border-color: rgba(0, 198, 255, 0.15) !important;
}
</style>
