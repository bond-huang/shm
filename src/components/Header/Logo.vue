<template>
  <div class="shm-logo" @click="goHome">
    <div class="logo-icon">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#headerGrad)" stroke-width="2" fill="none"/>
        <path d="M24 14L34 20V32L24 38L14 32V20L24 14Z" stroke="url(#headerGrad)" stroke-width="2" fill="rgba(0,198,255,0.06)"/>
        <circle cx="24" cy="24" r="3.5" fill="url(#headerGrad)"/>
        <defs>
          <linearGradient id="headerGrad" x1="6" y1="4" x2="42" y2="44">
            <stop offset="0%" stop-color="#00c6ff"/>
            <stop offset="100%" stop-color="#0072ff"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span class="logo-text">System Health Management</span>
  </div>
</template>

<script>
export default {
  name: 'Logo',
  methods: {
    goHome() {
      this.$router.push('/dashboard');
    }
  }
};
</script>

<style scoped>
.shm-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.shm-logo:hover {
  opacity: 0.85;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  animation: logoPulse 3s ease-in-out infinite;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes logoPulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(0, 198, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 10px rgba(0, 198, 255, 0.7)); }
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  white-space: nowrap;
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
