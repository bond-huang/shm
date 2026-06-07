<template>
  <div>
    <div class="page-title">
      <div class="title-glow"></div>
      <h2 class="gradient-text">Analytical Tools</h2>
      <p class="title-desc">Integrated toolset for system management and operations</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="6" v-for="tool in tools" :key="tool.key" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="tool-card" @click="openTool(tool.key)">
          <div class="tool-content">
            <div class="tool-icon" :style="{ background: tool.gradient }">
              <i :class="tool.icon"></i>
            </div>
            <div class="tool-info">
              <h4>{{ tool.name }}</h4>
              <p>{{ tool.desc }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "AllTool",
  data() {
    return {
      tools: [
        { key: 'analysis',    name: 'Analysis Tool',       desc: 'CSV/Excel data analysis with Python',        icon: 'bi bi-graph-up-arrow',    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        { key: 'monitor',     name: 'Monitor Tool',        desc: 'Real-time system monitoring and alerts',     icon: 'bi bi-activity',          gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        { key: 'inspect',     name: 'Inspect Tool',        desc: 'System health inspection and checks',        icon: 'bi bi-search-heart',      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        { key: 'backup',      name: 'Backup & Restore',    desc: 'Data backup and recovery operations',        icon: 'bi bi-cloud-arrow-up',    gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
        { key: 'deploy',      name: 'Deploy Tool',         desc: 'Application deployment and release',         icon: 'bi bi-rocket-takeoff',    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
        { key: 'operation',   name: 'Operation Tool',      desc: 'Daily operations and maintenance',           icon: 'bi bi-sliders',           gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
        { key: 'optimize',    name: 'Optimize Tool',       desc: 'Performance tuning and optimization',        icon: 'bi bi-speedometer',       gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
        { key: 'network',     name: 'Network Tool',        desc: 'Network diagnostics and analysis',           icon: 'bi bi-diagram-3',         gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
        { key: 'security',    name: 'Security Tool',       desc: 'Security scanning and compliance checks',    icon: 'bi bi-shield-lock',       gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
        { key: 'debug',       name: 'Debug Tool',          desc: 'Troubleshooting and log analysis',           icon: 'bi bi-bug',               gradient: 'linear-gradient(135deg, #64748b, #475569)' }
      ]
    }
  },
  methods: {
    openTool(key) {
      this.$router.push(`/tool-${key}`);
    }
  }
}
</script>

<style scoped>
.tool-card {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.tool-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: transparent;
}
.tool-card :deep(.el-card__body) {
  padding: 20px;
}
.tool-content {
  display: flex;
  align-items: center;
  gap: 14px;
}
.tool-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}
.tool-card:hover .tool-icon {
  transform: scale(1.08) rotate(-3deg);
}
.tool-icon i {
  font-size: 22px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
.tool-info {
  flex: 1;
  min-width: 0;
}
.tool-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.tool-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}
</style>
