<template>
  <div class="shm-aside">
    <el-radio-group v-model="isCollapse">
      <el-button type="text" @click="click()">
      <i v-bind:class="foldicon"></i></el-button>
    </el-radio-group>
  <el-menu 
    default-active="1-1-1"
    class="el-menu-vertical-demo"
    @open="handleOpen" @close="handleClose" 
    :collapse="isCollapse" 
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b">
    <el-submenu index="1">
      <template #title>
        <i class="el-icon-menu"></i>
        <span>Systems Class</span>
      </template>
        <el-scrollbar style="height: 100%">
        <ChildrenMenu  v-bind:children="sideMenuList" />
        </el-scrollbar>
    </el-submenu>
    <el-submenu index="2">
      <template #title><i class="el-icon-bank-card"></i><span>System Admin</span></template>
        <el-menu-item-group>
          <el-menu-item index="2-1">
            <router-link to="/allsystems">
              All Systems</router-link></el-menu-item>
          <el-menu-item index="2-2">
            <router-link to="/modeller">
            System Class</router-link></el-menu-item>
      </el-menu-item-group>
    </el-submenu>
    <el-submenu index="3">
      <template #title><i class="el-icon-setting"></i><span>Setting</span></template>
      <el-menu-item-group>
        <el-menu-item index="3-1">User Setting</el-menu-item>
        <el-menu-item index="3-2">Other Setting</el-menu-item>
      </el-menu-item-group>
    </el-submenu>
    <el-menu-item index="4">
      <i class="el-icon-document"></i>
      <template #title>Document</template>
    </el-menu-item>
        <el-menu-item index="5">
      <i class="el-icon-question"></i>
      <template #title>Help</template>
    </el-menu-item>
  </el-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getMenu } from '@/api/menu.js';
import ChildrenMenu from '@/components/Aside/ChildrenMenu.vue';

export default {
  name: 'Aside',
  computed: {
    ...mapGetters(["height"])
  },
  components: {
    ChildrenMenu
  },
  data() {
    return {
    sideMenuList: [],
    isCollapse: true,
    foldicon:'el-icon-s-unfold'
    };
  },
  methods: {
    openPage(url) {
      this.$router.push(url);
    }, 
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
      },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
      },
    click:function(){
      if(this.isCollapse){
        this.foldicon = 'el-icon-s-fold';
      }else{
        this.foldicon = 'el-icon-s-unfold';
        }
      this.isCollapse = !this.isCollapse;
    },
    mounted(){
      getMenu().then(resp => {
        this.sideMenuList = resp
      })
    },
  }
}
</script>

<style scoped>
.shm-aside {
  float: left;
  text-align: left;
  padding: 2px 0px;
  line-height: 30px;
  background-color: #545c64;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  }
</style>
