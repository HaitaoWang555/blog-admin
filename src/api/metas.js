import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/metas/list',
    method: 'get',
    params: query
  })
}

export function createMetas(data) {
  return request({
    url: '/metas/addone',
    method: 'post',
    data
  })
}

export function updateMetas(data) {
  return request({
    url: '/metas/update',
    method: 'post',
    data
  })
}

export function delMetas(id) {
  return request({
    url: '/metas/delete',
    method: 'delete',
    params: { id }
  })
}
