<template>
  <div class="user-settings">
    <el-tabs v-model="activeTab">
      <!-- 修改密码 Tab -->
      <el-tab-pane label="Change Password" name="password">
        <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          label-width="150px"
          style="max-width: 480px; margin-top: 20px;"
        >
          <el-form-item label="Username" prop="username">
            <el-input v-model="passwordForm.username" disabled />
          </el-form-item>
          <el-form-item label="Old Password" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="Enter old password" />
          </el-form-item>
          <el-form-item label="New Password" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="Enter new password" />
          </el-form-item>
          <el-form-item label="Confirm Password" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="Confirm new password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">Update Password</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 用户管理 Tab (Admin Only) -->
      <el-tab-pane label="User Management" name="users" v-if="isAdmin">
        <div style="margin-bottom: 15px; text-align: right;">
          <el-button type="primary" size="small" @click="showAddUser = true">Add User</el-button>
        </div>

        <el-table :data="userList" stripe border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="Username" />
          <el-table-column prop="nickname" label="Nickname" />
          <el-table-column prop="role" label="Role" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">
                {{ row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="200" align="center">
            <template #default="{ row }">
              <el-button type="warning" size="mini" @click="openResetPwd(row)">Reset Pwd</el-button>
              <el-button type="danger" size="mini" @click="handleDeleteUser(row)" :disabled="row.username === 'admin'">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加用户弹窗 -->
    <el-dialog v-model="showAddUser" title="Add User" width="380px" :close-on-click-modal="false">
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserFormRef" label-width="100px" size="small">
        <el-form-item label="Username" prop="username">
          <el-input v-model="addUserForm.username" placeholder="Enter username" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="addUserForm.password" type="password" show-password placeholder="Enter password" />
        </el-form-item>
        <el-form-item label="Nickname" prop="nickname">
          <el-input v-model="addUserForm.nickname" placeholder="Enter nickname" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="addUserForm.role" style="width: 100%">
            <el-option label="User" value="user" />
            <el-option label="Admin" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="showAddUser = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="handleAddUser" :loading="addUserLoading">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="showResetPwd" title="Reset Password" width="340px" :close-on-click-modal="false">
      <p style="margin: 0 0 15px; color: #606266; font-size: 14px;">
        Reset password for: <b>{{ resetTarget.username }}</b>
      </p>
      <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdFormRef" label-width="120px" size="small">
        <el-form-item label="New Password" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" show-password placeholder="Enter new password" />
        </el-form-item>
        <el-form-item label="Confirm" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" show-password placeholder="Confirm password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="small" @click="showResetPwd = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="handleResetPwd" :loading="resetPwdLoading">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { changePassword, getUsers, addUser, deleteUser, resetPassword } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserSettings',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('Passwords do not match'))
      } else {
        callback()
      }
    }

    const validateResetConfirm = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error('Passwords do not match'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'password',
      passwordLoading: false,
      addUserLoading: false,
      resetPwdLoading: false,
      showAddUser: false,
      showResetPwd: false,
      userList: [],
      resetTarget: {},
      passwordForm: {
        username: this.$store.state.basic.userInfo.userId || 'admin',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      addUserForm: {
        username: '',
        password: '',
        nickname: '',
        role: 'user'
      },
      resetPwdForm: {
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, message: 'Please enter old password', trigger: 'blur' }],
        newPassword: [
          { required: true, message: 'Please enter new password', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: 'Please confirm password', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      },
      addUserRules: {
        username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
        password: [
          { required: true, message: 'Please enter password', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
        ]
      },
      resetPwdRules: {
        newPassword: [
          { required: true, message: 'Please enter new password', trigger: 'blur' },
          { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: 'Please confirm password', trigger: 'blur' },
          { validator: validateResetConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isAdmin() {
      return this.$store.state.basic.userInfo.userId === 'admin'
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.loadUsers()
    }
  },
  methods: {
    async handleChangePassword() {
      try {
        await this.$refs.passwordFormRef.validate()
      } catch {
        return
      }

      this.passwordLoading = true
      try {
        const res = await changePassword({
          username: this.passwordForm.username,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })

        if (res) {
          ElMessage.success('Password updated successfully')
          this.passwordForm.oldPassword = ''
          this.passwordForm.newPassword = ''
          this.passwordForm.confirmPassword = ''
        }
      } finally {
        this.passwordLoading = false
      }
    },
    async loadUsers() {
      const res = await getUsers()
      if (res) {
        this.userList = res
      }
    },
    async handleAddUser() {
      try {
        await this.$refs.addUserFormRef.validate()
      } catch {
        return
      }

      this.addUserLoading = true
      try {
        const res = await addUser(this.addUserForm)
        if (res) {
          ElMessage.success('User added successfully')
          this.showAddUser = false
          this.addUserForm = { username: '', password: '', nickname: '', role: 'user' }
          this.loadUsers()
        }
      } finally {
        this.addUserLoading = false
      }
    },
    async handleDeleteUser(row) {
      try {
        await ElMessageBox.confirm(
          `Are you sure to delete user "${row.username}"?`,
          'Confirm',
          { type: 'warning' }
        )

        const res = await deleteUser(row.id)
        if (res) {
          ElMessage.success('User deleted')
          this.loadUsers()
        }
      } catch {
        // cancelled
      }
    },
    openResetPwd(row) {
      this.resetTarget = row
      this.resetPwdForm = { newPassword: '', confirmPassword: '' }
      this.showResetPwd = true
    },
    async handleResetPwd() {
      try {
        await this.$refs.resetPwdFormRef.validate()
      } catch {
        return
      }

      this.resetPwdLoading = true
      try {
        const res = await resetPassword(this.resetTarget.id, this.resetPwdForm.newPassword)
        if (res) {
          ElMessage.success(`Password reset for ${this.resetTarget.username}`)
          this.showResetPwd = false
        }
      } finally {
        this.resetPwdLoading = false
      }
    }
  }
}
</script>
