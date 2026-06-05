import axios from "axios"
import qs from 'qs'

export function login(username, password){
    return axios.post('/login', qs.stringify({
        username: username,
        password: password
    }))
}

export function verifyPassword(username, password){
    return axios.post('/verify-password', {
        username: username,
        password: password
    }, {
        headers: { 'Content-Type': 'application/json' }
    })
}