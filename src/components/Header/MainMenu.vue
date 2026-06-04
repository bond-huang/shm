<template>
  <div class="nav-links">
    <div class="nav-item active" @click="goHome">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Home</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  methods: {
    goHome() {
      this.$router.push('/dashboard');
    }
  }
};
</script>

<style scoped>
.nav-links {
  display: flex;
  align-items: center;
  margin-left: 32px;
  height: 100%;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 198, 255, 0.08);
}

.nav-item.active {
  color: #00c6ff;
  background: rgba(0, 198, 255, 0.1);
}

.nav-item svg {
  width: 16px;
  height: 16px;
}
</style>
