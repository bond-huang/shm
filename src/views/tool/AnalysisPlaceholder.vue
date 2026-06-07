<template>
  <div>
    <div class="page-header">
      <el-button class="back-btn" size="small" @click="$router.push('/tool-analysis')">
        <i class="bi bi-arrow-left"></i>
      </el-button>
      <div class="header-info">
        <div class="header-tags">
          <span class="type-badge" :style="{ background: info.gradient }">
            <i :class="info.icon"></i> {{ info.title }}
          </span>
        </div>
      </div>
      <div class="header-glow"></div>
    </div>
    <el-empty description="Coming soon...">
      <el-button type="primary" disabled><i class="bi bi-tools"></i> Under Development</el-button>
    </el-empty>
  </div>
</template>

<script>
const MAP = {
  log:       { title: 'Log Analysis',         icon: 'bi bi-journal-text',           gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  network:   { title: 'Network Analysis',     icon: 'bi bi-diagram-3',              gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
  data:      { title: 'Data Analysis',        icon: 'bi bi-table',                  gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  config:    { title: 'Config Analysis',      icon: 'bi bi-gear-wide-connected',    gradient: 'linear-gradient(135deg, #64748b, #475569)' },
  rootcause: { title: 'Root Cause Analysis',  icon: 'bi bi-search',                 gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
  capacity:  { title: 'Capacity Analysis',    icon: 'bi bi-bar-chart-line',         gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
};
export default {
  name: "AnalysisPlaceholder",
  computed: {
    key() { return this.$route.path.replace('/analysis-', ''); },
    info() { return MAP[this.key] || { title: 'Analysis', icon: 'bi bi-graph-up', gradient: '#667eea' }; }
  }
}
</script>

<style scoped>
.page-header { position: relative; display: flex; align-items: center; margin-bottom: 16px; padding: 16px 20px; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.header-glow { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #00c6ff, #7c3aed, #ec4899); }
.back-btn { border-radius: 10px; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 1px solid #e2e8f0; background: #f8fafc; margin-right: 16px; }
.header-info { flex: 1; }
.header-tags { display: flex; align-items: center; gap: 10px; }
.type-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 14px; border-radius: 20px; color: #fff; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
</style>
