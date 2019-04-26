import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/getOne',
    method: 'get',
    params: { id }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/addone',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}

export function delArticles(id) {
  return request({
    url: '/article/delete',
    method: 'delete',
    params: { id }
  })
}
