import axios from 'axios';

export function getModeller() {
    return axios.get('/modeller')
}

export function getSystems() {
    return axios.get('/allsystems')
}

export function addHost(param) {
    return axios.post('/allsystems', {
        "HostId": param.HostId,
        "HostType": param.HostType,
        "HostName": param.HostName,
        "IPadd": param.IPadd,
        "Description": param.Description
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    })
}

export function updateHost(param) {
    return axios.put('/allsystems', {
        HostId: param.HostId,
        HostType: param.HostType,
        HostName: param.HostName,
        IPadd: param.IPadd,
        Description: param.Description
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    })

}

export function deleteHost(hostId) {
    return axios.delete(`/allsystems/${hostId}`)
}
