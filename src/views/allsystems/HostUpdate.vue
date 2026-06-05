<template>
  <div>
    <el-form ref="form" :model="form" label-width="150px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Host ID">
            <el-input v-model="form.HostId" disabled placeholder="Auto generated"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="HostType"
            :rules="[{ required: true, message: 'Please input Host Type', trigger: 'blur' }]"
            label="Host Type">
            <el-select v-model="form.HostType" placeholder="Select Host Type" style="width: 100%">
              <el-option label="AIX" value="AIX"></el-option>
              <el-option label="Linux" value="Linux"></el-option>
              <el-option label="Windows" value="Windows"></el-option>
              <el-option label="AS400" value="AS400"></el-option>
              <el-option label="Other" value="Other"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            prop="HostName"
            :rules="[{ required: true, message: 'Please input Host Name', trigger: 'blur' }]"
            label="Host Name">
            <el-input v-model="form.HostName" placeholder="Input Host Name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="IPadd"
            :rules="[{ required: true, message: 'Please input IP Address', trigger: 'blur' }]"
            label="IP Addr">
            <el-input v-model="form.IPadd" placeholder="Input IP Address"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Status">
            <el-select v-model="form.StatusInfo" placeholder="Select Status" style="width: 100%">
              <el-option label="Health" value="Health"></el-option>
              <el-option label="Warning" value="Warning"></el-option>
              <el-option label="Severe" value="Severe"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Category">
            <el-select v-model="form.Category" placeholder="Select Category" style="width: 100%">
              <el-option label="Database" value="Database"></el-option>
              <el-option label="Application" value="Application"></el-option>
              <el-option label="Web Server" value="Web Server"></el-option>
              <el-option label="Middleware" value="Middleware"></el-option>
              <el-option label="Infrastructure" value="Infrastructure"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Business Name">
            <el-input v-model="form.BusinessName" placeholder="Input Business Name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Data Center">
            <el-select v-model="form.DataCenter" placeholder="Select Data Center" style="width: 100%">
              <el-option label="DC-Beijing" value="DC-Beijing"></el-option>
              <el-option label="DC-Shanghai" value="DC-Shanghai"></el-option>
              <el-option label="DC-Guangzhou" value="DC-Guangzhou"></el-option>
              <el-option label="DC-Shenzhen" value="DC-Shenzhen"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-divider></el-divider>
    <div>
      <el-row>
        <el-button @click="save" size="small" type="primary">Save</el-button>
        <el-button @click="() => this.$router.push('/allsystems')" size="small">Cancel</el-button>
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
        HostId: this.$route.params.HostId || '',
        HostType: this.$route.params.HostType || '',
        HostName: this.$route.params.HostName || '',
        IPadd: this.$route.params.IPadd || '',
        StatusInfo: this.$route.params.StatusInfo || 'Health',
        Category: this.$route.params.Category || '',
        BusinessName: this.$route.params.BusinessName || '',
        DataCenter: this.$route.params.DataCenter || ''
      }
    };
  },
  methods: {
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (!this.form.HostId) {
            addHost(this.form).then(res => {
              if (res !== false) {
                this.$message.success("Added successfully");
                this.$router.push("/allsystems");
              }
            });
          } else {
            updateHost(this.form).then(res => {
              if (res !== false) {
                this.$message.success("Updated successfully");
                this.$router.push("/allsystems");
              }
            });
          }
        }
      });
    }
  }
};
</script>
