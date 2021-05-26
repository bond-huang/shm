<template>
  <div class="auth-body">
    <div class="container">
      <el-form class="form-auth">
        <h3>System Health Management</h3>
        <el-form-item prop="username" label="Username：">
          <el-input name="username" v-model="username" placeholder="Username" />
        </el-form-item>
        <el-form-item prop="password" label="Password: ">
          <el-input type="password" name="passwrod" v-model="password" placeholder="Password" />
        </el-form-item>
          <el-button type="primary" @click="loginSubmit">Sign in</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/login.js';

export default {
  name: "login",
  data() {
    return {
      username: "admin",
      password: "123456"
    };
  },
  methods: {
    loginSubmit() {
      login(this.username, this.password).then(resp => {
          if (resp) {
             this.$store.dispatch('loginStatus', true);
             this.$router.push('/dashboard')
          }
      });
    }
  }
};
</script>

<style>
.auth-body {
  background:url(../assets/background.jpg) repeat center 0px;
  background-size: cover;
  font-family: sans-serif;
  padding-top: 100px;
  padding-bottom: 150px;
}

.form-auth {
  max-width: 400px;
  padding: 15px;
  margin: 0 auto;
  background:rgba(255,255,255,0.3);		/* 背景颜色和透明度 */
  border-radius: 10px;					/* 边角弧度 */
}
.form-auth .checkbox {
  font-weight: normal;
}
</style>

