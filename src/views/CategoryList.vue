<template>
  <div>
    <h3 style="margin-bottom: 20px;">System Classification</h3>
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in categories" :key="item.category" style="margin-bottom: 20px;">
        <el-card shadow="hover" class="category-card" @click="goToDetail(item.category)">
          <div class="card-content">
            <div class="card-icon">
              <i :class="getIcon(item.category)"></i>
            </div>
            <div class="card-info">
              <h4>{{ item.category }}</h4>
              <p class="count">{{ item.count }} Systems</p>
              <div class="status-bar">
                <el-tag size="mini" type="success">{{ item.health_count }} Health</el-tag>
                <el-tag size="mini" type="warning" v-if="item.warning_count > 0">{{ item.warning_count }} Warning</el-tag>
                <el-tag size="mini" type="danger" v-if="item.severe_count > 0">{{ item.severe_count }} Severe</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getCategories } from "@/api/demo.js"

export default {
  name: "CategoryList",
  data() {
    return {
      categories: []
    }
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      const res = await getCategories();
      if (res) {
        this.categories = res;
      }
    },
    getIcon(category) {
      const icons = {
        'Database': 'bi bi-database',
        'Application': 'bi bi-app',
        'Web Server': 'bi bi-globe',
        'Middleware': 'bi bi-layers',
        'Infrastructure': 'bi bi-hdd-rack'
      }
      return icons[category] || 'bi bi-pc-display'
    },
    goToDetail(category) {
      this.$router.push({
        name: 'category-detail',
        params: { name: category }
      });
    }
  }
}
</script>

<style scoped>
.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 28px;
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-info h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.card-info .count {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #909399;
}

.status-bar {
  display: flex;
  gap: 8px;
}
</style>
