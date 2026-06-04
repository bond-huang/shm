<template>
  <div class="login-wrapper">
    <!-- 动态网格背景 -->
    <div class="grid-bg"></div>
    <!-- 浮动光点 -->
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="glow glow-3"></div>

    <div class="login-card">
      <!-- 顶部光晕条 -->
      <div class="card-glow"></div>

      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#grad)" stroke-width="2" fill="none"/>
            <path d="M24 14L34 20V32L24 38L14 32V20L24 14Z" stroke="url(#grad)" stroke-width="2" fill="rgba(0,198,255,0.08)"/>
            <circle cx="24" cy="24" r="4" fill="url(#grad)"/>
            <defs>
              <linearGradient id="grad" x1="6" y1="4" x2="42" y2="44">
                <stop offset="0%" stop-color="#00c6ff"/>
                <stop offset="100%" stop-color="#0072ff"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="title">SHM</h1>
        <p class="subtitle">System Health Management</p>
      </div>

      <!-- 表单 -->
      <div class="login-form">
        <div class="input-group">
          <span class="input-label">Username</span>
          <el-input
            v-model="username"
            placeholder="Enter your username"
            size="large"
          />
        </div>

        <div class="input-group">
          <span class="input-label">Password</span>
          <el-input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            size="large"
            show-password
            @keyup.enter="loginSubmit"
          />
        </div>

        <button type="button" class="login-btn" @click="loginSubmit" :class="{ loading: isLoading }">
          <span class="btn-text">{{ isLoading ? 'AUTHENTICATING...' : 'SIGN IN' }}</span>
          <span class="btn-glow"></span>
        </button>
      </div>

      <div class="footer-text">
        <span>Powered by SHM Platform</span>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/login.js'

export default {
  name: "login",
  data() {
    return {
      username: "admin",
      password: "123456",
      isLoading: false
    };
  },
  methods: {
    loginSubmit() {
      this.isLoading = true;
      login(this.username, this.password).then(resp => {
        if (resp) {
          this.$store.dispatch('loginStatus', true);
          this.$router.push('/dashboard')
        }
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e27;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 网格背景 */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 198, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 198, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

/* 浮动光晕 */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #0072ff, transparent 70%);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.glow-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #00c6ff, transparent 70%);
  bottom: -50px;
  left: -50px;
  animation-delay: -3s;
}

.glow-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #7b2ff7, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* 登录卡片 */
.login-card {
  position: relative;
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(16, 20, 44, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(0, 198, 255, 0.12);
  border-radius: 20px;
  box-shadow:
    0 0 40px rgba(0, 114, 255, 0.08),
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  z-index: 10;
  animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00c6ff, transparent);
  border-radius: 2px;
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  animation: logoPulse 3s ease-in-out infinite;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes logoPulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 198, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 20px rgba(0, 198, 255, 0.7)); }
}

.title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 6px;
  margin: 0;
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
}

/* 输入框 */
.login-form {
  width: 100%;
}

.input-group {
  margin-bottom: 24px;
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}

/* 登录按钮 */
.login-btn {
  position: relative;
  width: 100%;
  height: 48px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #0072ff, #00c6ff);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 114, 255, 0.35);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.login-btn:hover .btn-glow {
  opacity: 1;
}

/* 底部文字 */
.footer-text {
  text-align: center;
  margin-top: 28px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    width: 92%;
    padding: 36px 24px 28px;
  }

  .title {
    font-size: 22px;
    letter-spacing: 4px;
  }
}
</style>

<!-- Element Plus 输入框暗色覆盖（不加 scoped 才能穿透） -->
<style>
.login-wrapper .el-input {
  width: 100% !important;
}

.login-wrapper .el-input__wrapper {
  background: rgba(255, 255, 255, 0.04) !important;
  border-radius: 10px !important;
  box-shadow: 0 0 0 1px rgba(0, 198, 255, 0.15) inset !important;
  height: 48px !important;
  padding: 1px 12px !important;
  transition: all 0.3s ease !important;
}

.login-wrapper .el-input__inner {
  padding: 0 !important;
  color: #e0e6ed !important;
  font-size: 14px !important;
}

.login-wrapper .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px rgba(0, 198, 255, 0.35) inset !important;
}

.login-wrapper .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px rgba(0, 198, 255, 0.6) inset, 0 0 16px rgba(0, 198, 255, 0.1) !important;
}

.login-wrapper .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.25) !important;
}

.login-wrapper .el-input__suffix .el-input__icon {
  color: rgba(0, 198, 255, 0.5) !important;
}
</style>
