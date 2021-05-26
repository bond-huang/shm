<template>
  <div>
    <el-card>
      <Breadcrumb></Breadcrumb>
    </el-card>
    <div class="shm-content" :style="{height: (height-120)+'px'}">
      <section style="overflow: auto !important">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <el-card
              style="overflow: auto !important"
              :style="{height: (height-140)+'px'}">
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
.shm-content {
  border: #f6f3f3 solid 1px;
  background-color: #f6f3f3;
  overflow-y: auto;
  padding: 6px 6px;
}
</style>