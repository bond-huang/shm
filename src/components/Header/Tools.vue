<template>
  <div class="shm-tools">
    <el-dropdown @command="handleCommand">
      <span class="el-dropdown-link">
        <i class="bi bi-person-circle"></i>
        {{userInfo.nickname}}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="1">User Admin</el-dropdown-item>
        <el-dropdown-item command="2" divided>Logout</el-dropdown-item>
      </el-dropdown-menu>
      </template>
    </el-dropdown>
  &nbsp;&nbsp;
    <el-dropdown>
      <span class="el-dropdown-link">
        More<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <router-link to="/vuehome">
              <span class="glyphicon glyphicon-chevron-down"></span>
              &nbsp;Vuehome</router-link></el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/gump"><i class="bi bi-google"></i>
              Gump</router-link></el-dropdown-item>
          <el-dropdown-item>
            <a href="https://github.com/bond-huang" target="_blank"> 
            <i class="bi bi-github"></i>&nbsp;GitHub</a></el-dropdown-item>
          <el-dropdown-item>
            <a href="https://github.com/bond-huang/System-Health-Check/blob/main/LICENSE" target="_blank">
            <i class="el-icon-s-check"></i>&nbsp;License</a></el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Tools',
  computed: {
    ...mapGetters(["userInfo"])
  },
  methods: {
    handleCommand(command) {
      console.log(command)
      switch(command) {
        case "1":
          break;
        case "2":
          this.logout();
      }
    },
    logout() {
        this.$confirm('Are you sure logout?', 'Prompt information', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('loginStatus', false)
          this.$router.push('/login')
        });
    }
  }
};
</script>

<style>
.shm-tools {
  float: right;
  padding-right: 20px;
  color: #FFFFFF;
  font-size: 15px;
}
.el-dropdown-link {
  cursor: pointer;
  color: #FFFFFF;
}
</style>