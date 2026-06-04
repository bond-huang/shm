import axios from 'axios';
import { ElMessage } from 'element-plus';

axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

axios.interceptors.request.use(config => {
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