<template>
  <div>
    <el-table
    :data="allsysList.filter(data => !search
    || data.HostName.toLowerCase().includes(search.toLowerCase())
    || data.IPadd.toLowerCase().includes(search.toLowerCase())
    || data.HostType.toLowerCase().includes(search.toLowerCase())
    || data.Category.toLowerCase().includes(search.toLowerCase())
    || data.BusinessName.toLowerCase().includes(search.toLowerCase())
    || data.DataCenter.toLowerCase().includes(search.toLowerCase()))"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
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
            <el-button size="mini" type="success" @click="$router.push('/allsystems/update')">Add</el-button>
          </div>
        </template>
        <template #default="scope">
          <div style="display: flex; justify-content: flex-end; gap: 2px;">
            <el-button size="mini" style="padding: 4px 8px; font-size: 12px;" @click.stop="toHostEdit(scope.row)">
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
import { getSystems, deleteHost } from "@/api/demo.js"
import { verifyPassword } from "@/api/login.js"
import { ElMessage } from 'element-plus'

export default {
  name: "Allsystems",
  components: {
    BasicPagination
  },
  data() {
    return {
    pageIndex : 1,
    pageTotal: 1,
    pageSize : 10,
    allsysList: [],
    search: '',
    loading: false,
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
  methods: {
    pageChange (item) {
        this.pageIndex = item.pageIndex;
        this.pageSize = item.pageLimit;
        this.loadData();
    },
    toHostEdit(row) {
      this.$router.push({
        name: "update",
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
        this.loadData();
      } finally {
        this.deleteLoading = false;
      }
    },
    viewHost(row) {
      this.$router.push({
        name: 'host-detail',
        params: { id: row.HostId }
      });
    },
    getStatusIcon(status) {
      if (status === 'Severe') return 'bi bi-x-octagon-fill';
      if (status === 'Warning') return 'bi bi-exclamation-triangle-fill';
      return 'bi bi-check-circle-fill';
    },
    loadData() {
      this.loading = true;
      const status = this.$route.query.status || '';
      getSystems(this.pageIndex, this.pageSize, status).then(response => {
        this.allsysList = response.content;
        this.pageTotal = response.total;
        this.loading = false;
      });
    }
  },
  mounted() {
    this.loadData();
  },
  watch: {
    '$route.query.status'() {
      this.pageIndex = 1;
      this.loadData();
    }
  },
};
</script>

<style scoped>
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
