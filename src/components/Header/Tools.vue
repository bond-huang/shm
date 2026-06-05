<template>
  <div class="shm-tools">
    <!-- 用户下拉 -->
    <el-dropdown @command="handleCommand" trigger="click">
      <div class="tool-btn user-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>{{ userInfo.nickname }}</span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="dark-dropdown">
          <el-dropdown-item command="1">
            <span class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              User Admin
            </span>
          </el-dropdown-item>
          <el-dropdown-item command="2" divided>
            <span class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 更多下拉 -->
    <el-dropdown trigger="click">
      <div class="tool-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
        </svg>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="dark-dropdown">
          <el-dropdown-item>
            <router-link to="/vuehome" class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
              Vuehome
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/gump" class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Gump
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <a href="https://github.com/bond-huang" target="_blank" class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="currentColor" class="menu-icon">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </el-dropdown-item>
          <el-dropdown-item>
            <a href="https://github.com/bond-huang/shm/blob/master/LICENSE" target="_blank" class="dropdown-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="menu-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              License
            </a>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Tools',
  computed: {
    ...mapGetters(["userInfo"])
  },
  methods: {
    handleCommand(command) {
      switch(command) {
        case "1":
          this.$router.push('/user-settings');
          break;
        case "2":
          this.logout();
      }
    },
    logout() {
      this.$confirm('Are you sure logout?', 'Prompt information', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('loginStatus', false)
        this.$router.push('/login')
      });
    }
  }
};
</script>

<style scoped>
.shm-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: none;
}

.tool-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 198, 255, 0.08);
}

.tool-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tool-btn .arrow {
  width: 14px;
  height: 14px;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
  width: 100%;
}

.menu-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>

<!-- 暗色下拉菜单覆盖（全局样式，下拉菜单在 body 上） -->
<style>
.dark-dropdown .dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
  width: 100%;
  cursor: pointer;
  white-space: nowrap;
}

.dark-dropdown .menu-icon {
  width: 16px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.dark-dropdown {
  background: rgba(16, 20, 44, 0.95) !important;
  border: 1px solid rgba(0, 198, 255, 0.15) !important;
  border-radius: 10px !important;
  backdrop-filter: blur(16px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

.dark-dropdown .el-dropdown-menu__item {
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
  padding: 0 !important;
}

.dark-dropdown .el-dropdown-menu__item .dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  width: 100%;
}

.dark-dropdown .el-dropdown-menu__item:hover {
  background: rgba(0, 198, 255, 0.1) !important;
  color: #00c6ff !important;
}

.dark-dropdown .el-dropdown-menu__item:hover .menu-icon {
  color: #00c6ff !important;
}

.dark-dropdown .el-dropdown-menu__item.divided {
  border-top: 1px solid rgba(0, 198, 255, 0.1) !important;
}

.dark-dropdown .el-popper__arrow::before {
  background: rgba(16, 20, 44, 0.95) !important;
  border-color: rgba(0, 198, 255, 0.15) !important;
}
</style>
