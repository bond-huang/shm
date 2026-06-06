<template>
  <div>
    <!-- 顶部标题区 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button class="back-btn" size="small" @click="$router.push({ path: '/system-class', query: { type: classType } })">
          <i class="bi bi-arrow-left"></i>
        </el-button>
        <div class="header-info">
          <div class="header-tags">
            <span class="type-badge" :style="{ background: typeGradient }">
              <i :class="typeIcon"></i> {{ typeLabel }}
            </span>
            <span class="name-badge">{{ categoryName }}</span>
          </div>
          <span class="host-count">{{ hosts.length }} Systems</span>
        </div>
      </div>
      <div class="header-glow"></div>
    </div>

    <el-table
    :data="hosts.filter(data => !search
    || data.HostName.toLowerCase().includes(search.toLowerCase())
    || data.IPadd.toLowerCase().includes(search.toLowerCase())
    || data.HostType.toLowerCase().includes(search.toLowerCase())
    || data.Category.toLowerCase().includes(search.toLowerCase())
    || data.BusinessName.toLowerCase().includes(search.toLowerCase())
    || data.DataCenter.toLowerCase().includes(search.toLowerCase()))"
    stripe border style="width: 100%" v-loading="loading"
    :header-cell-style="{ background: '#f8fafc', color: '#334155', fontWeight: '600' }"
    :row-style="{ cursor: 'pointer' }"
    @row-click="viewHost">
      <el-table-column prop="HostType" label="HostType" width="90"></el-table-column>
      <el-table-column prop="HostName" label="HostName" width="110"></el-table-column>
      <el-table-column prop="IPadd" label="IP Addr" width="130"></el-table-column>
      <el-table-column prop="StatusInfo" label="Status" width="110">
        <template #default="{ row }">
          <span class="status-badge" :class="row.StatusInfo.toLowerCase()">
            <i :class="getStatusIcon(row.StatusInfo)"></i>
            {{ row.StatusInfo }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="Category" label="Category" width="100"></el-table-column>
      <el-table-column prop="BusinessName" label="Business Name" width="150"></el-table-column>
      <el-table-column prop="DataCenter" label="Data Center" width="120">
        <template #default="{ row }">
          <span class="dc-tag"><i class="bi bi-geo-alt"></i> {{ row.DataCenter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="right" min-width="220">
        <template #header>
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px;">
            <el-input v-model="search" size="mini" placeholder="Filter keywords" style="width: 140px;" />
          </div>
        </template>
        <template #default="scope">
          <div style="display: flex; justify-content: flex-end; gap: 2px;">
            <el-button size="mini" style="padding: 4px 8px; font-size: 12px;" @click.stop="editHost(scope.row)">
              <i class="bi bi-pencil-square"></i> Edit
            </el-button>
            <el-button size="mini" type="danger" style="padding: 4px 8px; font-size: 12px;" @click.stop="openDeleteDialog(scope.row)">
              <i class="bi bi-trash3"></i> Delete
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <basic-pagination :total="pageTotal" @pageChange="pageChange"></basic-pagination>

    <!-- 删除验证弹窗 -->
    <el-dialog v-model="showDeleteDialog" title="Confirm Delete" width="380px" :close-on-click-modal="false">
      <p style="margin: 0 0 15px; color: #606266; font-size: 14px;">
        Are you sure to delete <b>{{ deleteTarget.HostName }}</b> ({{ deleteTarget.IPadd }})?
      </p>
      <el-form :model="deleteForm" :rules="deleteRules" ref="deleteFormRef" label-width="100px" size="small">
        <el-form-item label="Username">
          <el-input v-model="deleteForm.username" disabled />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="deleteForm.password" type="password" show-password placeholder="Enter your password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button size="small" type="danger" @click="confirmDelete" :loading="deleteLoading">Delete</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import BasicPagination from "@/components/pagination/BasicPagination"
import { getCategoryHosts, getDataCenterHosts, getHostTypeHosts, deleteHost } from "@/api/demo.js"
import { verifyPassword } from "@/api/login.js"
import { ElMessage } from 'element-plus'

export default {
  name: "CategoryDetail",
  components: {
    BasicPagination
  },
  data() {
    return {
      categoryName: '',
      classType: 'usage',
      hosts: [],
      loading: false,
      search: '',
      pageTotal: 0,
      showDeleteDialog: false,
      deleteLoading: false,
      deleteTarget: {},
      deleteForm: {
        username: this.$store.state.basic.userInfo.userId || 'admin',
        password: ''
      },
      deleteRules: {
        password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
      }
    }
  },
  computed: {
    typeLabel() {
      if (this.classType === 'datacenter') return 'Data Center';
      if (this.classType === 'hosttype') return 'System Type';
      return 'Usage';
    },
    typeIcon() {
      if (this.classType === 'datacenter') return 'bi bi-building';
      if (this.classType === 'hosttype') return 'bi bi-cpu';
      return 'bi bi-grid-3x3-gap';
    },
    typeGradient() {
      if (this.classType === 'datacenter') return 'linear-gradient(135deg, #0ea5e9, #2563eb)';
      if (this.classType === 'hosttype') return 'linear-gradient(135deg, #8b5cf6, #a78bfa)';
      return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    }
  },
  mounted() {
    this.categoryName = this.$route.params.name;
    this.classType = this.$route.query.type || 'usage';
    this.loadHosts();
  },
  watch: {
    '$route.params.name'(val) {
      this.categoryName = val;
      this.loadHosts();
    },
    '$route.query.type'(val) {
      this.classType = val || 'usage';
      this.loadHosts();
    }
  },
  methods: {
    async loadHosts() {
      this.loading = true;
      let res;
      if (this.classType === 'datacenter') {
        res = await getDataCenterHosts(this.categoryName);
      } else if (this.classType === 'hosttype') {
        res = await getHostTypeHosts(this.categoryName);
      } else {
        res = await getCategoryHosts(this.categoryName);
      }
      if (res) {
        this.hosts = res;
        this.pageTotal = res.length;
      }
      this.loading = false;
    },
    pageChange() {
      // 前端分页由 el-table 自行处理，此处预留
    },
    getStatusIcon(status) {
      if (status === 'Severe') return 'bi bi-x-octagon-fill';
      if (status === 'Warning') return 'bi bi-exclamation-triangle-fill';
      return 'bi bi-check-circle-fill';
    },
    viewHost(row) {
      this.$router.push({
        name: 'host-detail',
        params: { id: row.HostId }
      });
    },
    editHost(row) {
      this.$router.push({
        name: 'update',
        params: {
          HostId: row.HostId,
          HostType: row.HostType,
          HostName: row.HostName,
          IPadd: row.IPadd,
          StatusInfo: row.StatusInfo,
          Category: row.Category,
          BusinessName: row.BusinessName,
          DataCenter: row.DataCenter
        }
      });
    },
    openDeleteDialog(row) {
      this.deleteTarget = row;
      this.deleteForm.password = '';
      this.showDeleteDialog = true;
    },
    async confirmDelete() {
      try {
        await this.$refs.deleteFormRef.validate();
      } catch {
        return;
      }

      this.deleteLoading = true;
      try {
        const verifyRes = await verifyPassword(this.deleteForm.username, this.deleteForm.password);
        if (verifyRes === false) {
          this.deleteLoading = false;
          return;
        }

        await deleteHost(this.deleteTarget.HostId);
        ElMessage.success("Successfully Deleted");
        this.showDeleteDialog = false;
        this.loadHosts();
      } finally {
        this.deleteLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 顶部标题区 */
.detail-header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.header-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #00c6ff, #7c3aed, #ec4899);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.back-btn {
  border-radius: 10px;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.type-badge i {
  font-size: 13px;
}

.name-badge {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.host-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  padding: 3px 10px;
  background: #f1f5f9;
  border-radius: 12px;
}

/* Status 标签 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge i {
  font-size: 11px;
}

.status-badge.health {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.severe {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* DataCenter 标签 */
.dc-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.dc-tag i {
  color: #0ea5e9;
}
</style>
