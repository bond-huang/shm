import axios from "axios";

export function getCpuperf(hostId){
    return axios.get('/cpuperf', { params: { hostId } })
}

export function getRealtimePerf(hostId){
    return axios.get(`/perf/realtime/${hostId}`)
}

export function getPerfHistory(hostId){
    return axios.get(`/perf/history/${hostId}`)
}
