import axios from 'axios';
import { ElMessage } from 'element-plus';

axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axios.interceptors.request.use(config => {
    // 发送 FormData 时让浏览器自动设置 Content-Type（含 boundary）
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, error => {
    ElMessage.error(error)
})

axios.interceptors.response.use(response => {
    if (response && response.status == 200) {
        if (response.data.statusCode == "200") {
            return response.data.data;
        } else {
            ElMessage.error(response.data.statusMessage)
            return false;
        }
    }
    ElMessage.error('Request API failed');
}, error => {
    ElMessage.error(error)
    return false;
})