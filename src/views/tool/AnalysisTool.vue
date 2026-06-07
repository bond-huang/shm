<template>
  <div>
    <div class="page-header">
      <el-button class="back-btn" size="small" @click="$router.push('/analytical-tools')">
        <i class="bi bi-arrow-left"></i>
      </el-button>
      <div class="header-info">
        <div class="header-tags">
          <span class="type-badge" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <i class="bi bi-graph-up-arrow"></i> Analysis Tool
          </span>
          <span class="name-badge">Select Analysis Category</span>
        </div>
      </div>
      <div class="header-glow"></div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6" v-for="cat in categories" :key="cat.key" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="cat-card" @click="openCategory(cat.key)">
          <div class="cat-content">
            <div class="cat-icon" :style="{ background: cat.gradient }">
              <i :class="cat.icon"></i>
            </div>
            <div class="cat-info">
              <h4>{{ cat.name }}</h4>
              <p>{{ cat.desc }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "AnalysisTool",
  data() {
    return {
      categories: [
        { key: 'performance', name: 'Performance Analysis', desc: 'CPU, memory, disk, I/O performance data analysis', icon: 'bi bi-speedometer2', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
        { key: 'log',         name: 'Log Analysis',         desc: 'System and application log parsing and analysis', icon: 'bi bi-journal-text', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        { key: 'network',     name: 'Network Analysis',     desc: 'Network traffic, latency and connectivity analysis', icon: 'bi bi-diagram-3', gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
        { key: 'data',        name: 'Data Analysis',        desc: 'CSV, Excel, database data exploration and reporting', icon: 'bi bi-table', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
        { key: 'config',      name: 'Config Analysis',      desc: 'Configuration file comparison and validation', icon: 'bi bi-gear-wide-connected', gradient: 'linear-gradient(135deg, #64748b, #475569)' },
        { key: 'rootcause',   name: 'Root Cause Analysis',  desc: 'Incident investigation and root cause identification', icon: 'bi bi-search', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
        { key: 'capacity',    name: 'Capacity Analysis',    desc: 'Resource usage trending and capacity planning', icon: 'bi bi-bar-chart-line', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }
      ]
    }
  },
  methods: {
    openCategory(key) {
      this.$router.push(`/analysis-${key}`);
    }
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
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
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
.cat-card {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.cat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: transparent;
}
.cat-card :deep(.el-card__body) { padding: 20px; }
.cat-content { display: flex; align-items: center; gap: 14px; }
.cat-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}
.cat-card:hover .cat-icon { transform: scale(1.08) rotate(-3deg); }
.cat-icon i { font-size: 22px; color: #fff; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2)); }
.cat-info { flex: 1; min-width: 0; }
.cat-info h4 { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #1e293b; }
.cat-info p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4; }
</style>
