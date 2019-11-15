import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/user/getOneById',
    method: 'get'
  })
}
export function getAllUser() {
  return request({
    url: '/user/list',
    method: 'get'
  })
}
export function getUserList(params) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
export function addUser(data) {
  return request({
    url: '/user/addUser',
    method: 'post',
    data
  })
}
export function updateUser(data) {
  return request({
    url: '/user/updateUser',
    method: 'post',
    data
  })
}
export function deleteUser(params) {
  return request({
    url: '/user/delUser',
    method: 'delete',
    params
  })
}
export function haveUserName(data) {
  return request({
    url: '/user/haveUserName',
    method: 'post',
    data
  })
}
