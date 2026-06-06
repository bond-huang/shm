<template>
  <div>
    <div class="page-title">
      <div class="title-glow"></div>
      <h2 class="gradient-text">Tool Classification</h2>
      <p class="title-desc">Organize tools by category and usage</p>
    </div>

    <el-empty description="Coming soon...">
      <el-button type="primary" disabled>
        <i class="bi bi-plus-lg"></i> Add Category
      </el-button>
    </el-empty>
  </div>
</template>

<script>
export default {
  name: "ToolClass"
}
</script>

<style scoped>
.page-title {
  position: relative;
  margin-bottom: 8px;
  padding: 16px 0 12px;
}

.title-glow {
  position: absolute;
  top: 0;
  left: 20%;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00c6ff, #7c3aed, #ec4899, transparent);
  border-radius: 2px;
  animation: glowSlide 4s ease-in-out infinite;
}

@keyframes glowSlide {
  0%, 100% { opacity: 0.6; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}

.gradient-text {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #00c6ff 0%, #7c3aed 50%, #ec4899 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 6s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.title-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
  letter-spacing: 0.5px;
}
</style>
