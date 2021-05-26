<template>
  <div>
    <div>
      <h2>{{ msg }}</h2>
      <img alt="Forrest Gump" src="../assets/gump.jpg">
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  name : 'Gump',
  data() {
    return {
      msg: 'Miracles happen every day.'
    }
  },
  methods: {
      getMessage() {
          const path = 'http://127.0.0.1:5000/gump';
          axios.get(path)
          .then((res) => {
              this.msg = res.data;
          })
          .catch((error) => {
              // eslint-disable-next-line
              console.error(error);
          })
      }
  },
  created() {
      this.getMessage();
  }
}
</script>