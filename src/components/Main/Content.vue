<template>
  <div class="content-container">
    <el-card class="breadcrumb-card">
      <Breadcrumb></Breadcrumb>
    </el-card>
    <div class="shm-content">
      <section class="content-section">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <el-card class="main-card">
              <router-view></router-view>
            </el-card>
          </keep-alive>
        </transition>
      </section>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Main/Breadcrumb.vue";

export default {
  name: "Content",
  components: {
    Breadcrumb
  },
  computed: {
    ...mapGetters(["height"])
  },
}
</script>

<style scoped>
.content-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.breadcrumb-card {
  flex-shrink: 0;
}

.shm-content {
  flex: 1;
  background-color: #f6f3f3;
  padding: 6px 6px;
}

.content-section {
  min-height: calc(100vh - 160px);
}

.main-card {
  min-height: calc(100vh - 200px);
}
</style>