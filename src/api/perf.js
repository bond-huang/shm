import axios from "axios";

export function getCpuperf(){
    return axios.get('/cpuperf')
}