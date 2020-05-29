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
    url: '/metas/add',
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

export function delMetas(ids) {
  return request({
    url: '/metas/delete',
    method: 'delete',
    params: { ids }
  })
}

export function downloadList(ids) {
  return request({
    url: '/download/meta',
    method: 'get',
    responseType: 'blob',
    params: { ids }
  })
}
export function downloadTemplate() {
  return request({
    url: '/download/metaTemplate',
    method: 'get',
    responseType: 'blob'
  })
}
