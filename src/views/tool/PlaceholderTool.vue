<template>
  <div>
    <div class="page-header">
      <el-button class="back-btn" size="small" @click="$router.push('/analytical-tools')">
        <i class="bi bi-arrow-left"></i>
      </el-button>
      <div class="header-info">
        <div class="header-tags">
          <span class="type-badge" :style="{ background: gradient }">
            <i :class="icon"></i> {{ title }}
          </span>
          <span class="name-badge">{{ desc }}</span>
        </div>
      </div>
      <div class="header-glow"></div>
    </div>
    <el-empty description="Coming soon...">
      <el-button type="primary" disabled>
        <i class="bi bi-tools"></i> Under Development
      </el-button>
    </el-empty>
  </div>
</template>

<script>
const TOOL_MAP = {
  monitor:   { title: 'Monitor Tool',      desc: 'Real-time system monitoring and alerts',     icon: 'bi bi-activity',        gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  inspect:   { title: 'Inspect Tool',      desc: 'System health inspection and checks',        icon: 'bi bi-search-heart',    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  backup:    { title: 'Backup & Restore',  desc: 'Data backup and recovery operations',        icon: 'bi bi-cloud-arrow-up',  gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
  deploy:    { title: 'Deploy Tool',       desc: 'Application deployment and release',         icon: 'bi bi-rocket-takeoff',  gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  operation: { title: 'Operation Tool',    desc: 'Daily operations and maintenance',           icon: 'bi bi-sliders',         gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  optimize:  { title: 'Optimize Tool',     desc: 'Performance tuning and optimization',        icon: 'bi bi-speedometer',     gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
  network:   { title: 'Network Tool',      desc: 'Network diagnostics and analysis',           icon: 'bi bi-diagram-3',       gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  security:  { title: 'Security Tool',     desc: 'Security scanning and compliance checks',    icon: 'bi bi-shield-lock',     gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  debug:     { title: 'Debug Tool',        desc: 'Troubleshooting and log analysis',           icon: 'bi bi-bug',             gradient: 'linear-gradient(135deg, #64748b, #475569)' }
};

export default {
  name: "PlaceholderTool",
  computed: {
    toolKey() {
      const path = this.$route.path;
      return path.replace('/tool-', '');
    },
    toolInfo() {
      return TOOL_MAP[this.toolKey] || { title: 'Tool', desc: '', icon: 'bi bi-tools', gradient: '#667eea' };
    },
    title() { return this.toolInfo.title; },
    desc() { return this.toolInfo.desc; },
    icon() { return this.toolInfo.icon; },
    gradient() { return this.toolInfo.gradient; }
  }
}
</script>

<style scoped>
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.header-glow {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(90deg, #00c6ff, #7c3aed, #ec4899);
}
.back-btn {
  border-radius: 10px;
  width: 36px; height: 36px;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  margin-right: 16px;
}
.header-info { flex: 1; }
.header-tags { display: flex; align-items: center; gap: 10px; }
.type-badge {
  display: inline-flex;
  align-items: center; gap: 5px;
  padding: 5px 14px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px; font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.name-badge {
  font-size: 20px; font-weight: 700;
  color: #1e293b;
}
</style>
