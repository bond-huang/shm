<template>
  <div>
    <!-- 炫酷标题 -->
    <div class="page-title">
      <div class="title-glow"></div>
      <h2 class="gradient-text">System Classification</h2>
      <p class="title-desc">Organize and monitor your infrastructure by different dimensions</p>
    </div>

    <el-tabs v-model="activeTab" @tab-click="onTabChange" class="class-tabs">
      <el-tab-pane name="usage">
        <template #label>
          <span class="tab-label"><i class="bi bi-grid-3x3-gap"></i> By Usage</span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="datacenter">
        <template #label>
          <span class="tab-label"><i class="bi bi-building"></i> By Data Center</span>
        </template>
      </el-tab-pane>
      <el-tab-pane name="hosttype">
        <template #label>
          <span class="tab-label"><i class="bi bi-cpu"></i> By System Type</span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <el-row :gutter="20">
      <el-col :span="6" v-for="item in categories" :key="item.name" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="category-card" @click="goToDetail(item.name)">
          <div class="card-content">
            <div class="card-icon" :style="{ background: getGradient(item.name) }">
              <svg v-if="getSvgIcon(item.name)" class="icon-svg" viewBox="0 0 24 24" fill="white"
                v-html="getSvgIcon(item.name)"></svg>
              <i v-else :class="getIcon(item.name)"></i>
            </div>
            <div class="card-info">
              <h4>{{ item.name }}</h4>
              <p class="count">{{ item.count }} Systems</p>
              <div class="status-bar">
                <span class="status-chip health">
                  <i class="bi bi-check-circle-fill"></i> {{ item.health_count }}
                </span>
                <span class="status-chip warning" v-if="item.warning_count > 0">
                  <i class="bi bi-exclamation-triangle-fill"></i> {{ item.warning_count }}
                </span>
                <span class="status-chip severe" v-if="item.severe_count > 0">
                  <i class="bi bi-x-octagon-fill"></i> {{ item.severe_count }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getCategories, getDataCenters, getHostTypes } from "@/api/demo.js"

// 自定义 SVG 图标 (viewBox="0 0 24 24")
const SVG_ICONS = {
  // Linux 企鹅 Tux
  'Linux': '<ellipse cx="12" cy="11" rx="6" ry="7.5"/><ellipse cx="12" cy="12.5" rx="4" ry="5" fill="rgba(0,0,0,0.15)"/><circle cx="10.2" cy="8.5" r="1" fill="rgba(0,0,0,0.3)"/><circle cx="13.8" cy="8.5" r="1" fill="rgba(0,0,0,0.3)"/><ellipse cx="12" cy="9.8" rx="1.2" ry="0.7" fill="#f97316"/><path d="M7 20.5c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  // Windows 四格窗口
  'Windows': '<rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5"/><rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="13" y="13" width="9" height="9" rx="1.5"/>',
  // AIX IBM 芯片风格
  'AIX': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1" fill="rgba(0,0,0,0.2)"/><line x1="9" y1="4" x2="9" y2="2" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="4" x2="12" y2="2" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="15" y1="4" x2="15" y2="2" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="22" x2="9" y2="20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="22" x2="12" y2="20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="15" y1="22" x2="15" y2="20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="9" x2="4" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="12" x2="4" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="15" x2="4" y2="15" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="9" x2="20" y2="9" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="12" x2="20" y2="12" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="22" y1="15" x2="20" y2="15" stroke="white" stroke-width="1.5" stroke-linecap="round"/>',
  // AS400 服务器机柜
  'AS400': '<rect x="4" y="2" width="16" height="6" rx="1.5"/><rect x="4" y="9" width="16" height="6" rx="1.5"/><rect x="4" y="16" width="16" height="6" rx="1.5"/><circle cx="7" cy="5" r="1" fill="rgba(0,0,0,0.3)"/><circle cx="7" cy="12" r="1" fill="rgba(0,0,0,0.3)"/><circle cx="7" cy="19" r="1" fill="rgba(0,0,0,0.3)"/><line x1="10" y1="5" x2="18" y2="5" stroke="rgba(0,0,0,0.2)" stroke-width="1"/><line x1="10" y1="12" x2="18" y2="12" stroke="rgba(0,0,0,0.2)" stroke-width="1"/><line x1="10" y1="19" x2="18" y2="19" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>'
};

export default {
  name: "CategoryList",
  data() {
    return {
      activeTab: 'usage',
      categories: []
    }
  },
  mounted() {
    this.activeTab = this.$route.query.type || 'usage';
    this.loadData();
  },
  methods: {
    async loadData() {
      let res;
      if (this.activeTab === 'datacenter') {
        res = await getDataCenters();
      } else if (this.activeTab === 'hosttype') {
        res = await getHostTypes();
      } else {
        res = await getCategories();
      }
      if (res) {
        this.categories = res.map(item => ({
          ...item,
          name: item.name || item.category
        }));
      }
    },
    onTabChange() {
      this.$router.replace({ query: { type: this.activeTab } });
      this.loadData();
    },
    getSvgIcon(name) {
      return SVG_ICONS[name] || null;
    },
    getIcon(name) {
      const icons = {
        'Database':       'bi bi-database-fill',
        'Application':    'bi bi-box-seam-fill',
        'Web Server':     'bi bi-globe2',
        'Middleware':      'bi bi-layers-fill',
        'Infrastructure': 'bi bi-hdd-network-fill',
      };
      if (name.startsWith('DC-')) return 'bi bi-geo-alt-fill';
      return icons[name] || 'bi bi-pc-display';
    },
    getGradient(name) {
      const gradients = {
        'Database':       'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'Application':    'linear-gradient(135deg, #ec4899, #f43f5e)',
        'Web Server':     'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'Middleware':      'linear-gradient(135deg, #10b981, #14b8a6)',
        'Infrastructure': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'AIX':            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'Linux':          'linear-gradient(135deg, #f97316, #ea580c)',
        'Windows':        'linear-gradient(135deg, #0ea5e9, #0284c7)',
        'AS400':          'linear-gradient(135deg, #64748b, #475569)'
      };
      if (name.startsWith('DC-')) return 'linear-gradient(135deg, #0ea5e9, #2563eb)';
      return gradients[name] || 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    },
    goToDetail(name) {
      this.$router.push({
        name: 'category-detail',
        params: { name },
        query: { type: this.activeTab }
      });
    }
  }
}
</script>

<style scoped>
/* 炫酷标题 */
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

/* Tab 样式 */
.class-tabs {
  margin-bottom: 8px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.tab-label i {
  font-size: 15px;
}

/* 卡片 */
.category-card {
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.category-card :deep(.el-card__body) {
  padding: 16px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图标容器 */
.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.category-card:hover .card-icon {
  transform: scale(1.08) rotate(-3deg);
}

.card-icon i {
  font-size: 24px;
  color: #fff;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.icon-svg {
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 信息区 */
.card-info {
  flex: 1;
  min-width: 0;
}

.card-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-info .count {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

/* 状态标签 */
.status-bar {
  display: flex;
  gap: 8px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.status-chip i {
  font-size: 11px;
}

.status-chip.health {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-chip.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-chip.severe {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

</style>
