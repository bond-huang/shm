<template>
  <div>
    <el-form ref="form" :model="form" label-width="180px">
      <el-row>
        <el-col :span="13">
          <el-form-item
            prop="HostId"
            :rules="[{ required: true, message: 'Please input Host ID', trigger: 'blur' },]"
            label="Host ID">
            <el-input v-model="form.hostlId" placeholder="When empty, automatically generated"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="13">
          <el-form-item
            prop="HostType"
            :rules="[{ required: true, message: 'Please input Host Type', trigger: 'blur' },]"
            label="Host Type">
            <el-input v-model="form.HostType" placeholder="Input Host Type"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="13">
          <el-form-item
            prop="HostName"
            :rules="[{ required: true, message: 'Please input Host Name', trigger: 'blur' },]"
            label="Host Name">
            <el-input v-model="form.HostName" placeholder="Input Host Name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="13">
          <el-form-item
            prop="IPadd"
            :rules="[{ required: true, message: 'Please input Host IP Address', trigger: 'blur' },]"
            label="Host IP Address">
            <el-input v-model="form.IPadd" placeholder="Input Host IP Address"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="13">
          <el-form-item label="Description">
            <el-input v-model="form.Description" placeholder="Input Host Description"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider></el-divider>
    <div>
      <el-row>
        <el-button @click="save" size="small" type="primary">Save</el-button>
        <el-button @click="() => this.$router.push('/allsystems')" size="small" type="primary">Cancel</el-button>
      </el-row>
    </div>
  </div>
</template>

<script>
import { addHost, updateHost } from "@/api/demo.js";

export default {
  data() {
    return {
      form: {
        HostlId: this.$route.params.HostId,
        HostType: this.$route.params.HostType,
        HostName: this.$route.params.HostName,
        IPadd:this.$route.params.IPadd,
        Description: this.$route.params.Description
      }
    };
  },
  methods: {
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.HostId == "" || this.form.HostId == undefined) {
            //新增
            addHost(this.form).then(flag => {
              console.log("Submit result：", flag);
              this.$router.push("/allsystems");
            });
          } else {
            //修改
            updateHost(this.form).then(flag => {
              console.log("Submit result：", flag);
              this.$router.push("//allsystems");
            });
          }
        }
      });
    }
  }
};
</script>