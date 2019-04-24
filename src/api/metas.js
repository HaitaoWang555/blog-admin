import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/manage/metas/list',
    method: 'get',
    params: query
  })
}

export function createMetas(data) {
  return request({
    url: '/manage/metas/addone',
    method: 'post',
    data
  })
}

export function updateMetas(data) {
  return request({
    url: '/manage/metas/update',
    method: 'post',
    data
  })
}

export function delMetas(id) {
  return request({
    url: '/manage/metas/delete',
    method: 'delete',
    params: { id }
  })
}
