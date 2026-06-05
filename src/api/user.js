import axios from 'axios'

// 获取用户列表
export function getUsers() {
  return axios.get('/users')
}

// 添加用户
export function addUser(data) {
  return axios.post('/users', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 更新用户
export function updateUser(id, data) {
  return axios.put(`/users/${id}`, data, {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 删除用户
export function deleteUser(id) {
  return axios.delete(`/users/${id}`)
}

// 管理员重置用户密码
export function resetPassword(id, newPassword) {
  return axios.put(`/users/${id}/reset-password`, { newPassword }, {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 修改密码
export function changePassword(data) {
  return axios.put('/password', data, {
    headers: { 'Content-Type': 'application/json' }
  })
}
