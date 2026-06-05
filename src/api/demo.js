import axios from 'axios';

export function getModeller() {
    return axios.get('/modeller')
}

export function getSystems(page = 1, pageSize = 10) {
    return axios.get('/allsystems', { params: { page, pageSize } })
}

export function addHost(param) {
    return axios.post('/allsystems', {
        HostId: param.HostId,
        HostType: param.HostType,
        HostName: param.HostName,
        IPadd: param.IPadd,
        StatusInfo: param.StatusInfo,
        Category: param.Category,
        BusinessName: param.BusinessName,
        DataCenter: param.DataCenter
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    })
}

export function updateHost(param) {
    return axios.put(`/allsystems/${param.HostId}`, {
        HostType: param.HostType,
        HostName: param.HostName,
        IPadd: param.IPadd,
        StatusInfo: param.StatusInfo,
        Category: param.Category,
        BusinessName: param.BusinessName,
        DataCenter: param.DataCenter
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    })
}

export function deleteHost(hostId) {
    return axios.delete(`/allsystems/${hostId}`)
}

export function getCategories() {
    return axios.get('/categories')
}

export function getCategoryHosts(categoryName) {
    return axios.get(`/categories/${encodeURIComponent(categoryName)}/hosts`)
}
