import axios from 'axios';

export function getModeller() {
    return axios.get('/modeller')
}

export function getSystems(page = 1, pageSize = 10, status = '') {
    return axios.get('/allsystems', { params: { page, pageSize, status } })
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

export function getDataCenters() {
    return axios.get('/datacenters')
}

export function getDataCenterHosts(dcName) {
    return axios.get(`/datacenters/${encodeURIComponent(dcName)}/hosts`)
}

export function getHostTypes() {
    return axios.get('/hosttypes')
}

export function getHostTypeHosts(typeName) {
    return axios.get(`/hosttypes/${encodeURIComponent(typeName)}/hosts`)
}

export function saveSshCredentials(hostId, sshUser, sshPassword) {
    return axios.put(`/hosts/${hostId}/ssh`, {
        ssh_user: sshUser,
        ssh_password: sshPassword
    }, {
        headers: { "Content-Type": "application/json" }
    })
}

export function getSshCredentials(hostId) {
    return axios.get(`/hosts/${hostId}/ssh`)
}
