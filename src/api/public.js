import request from '@/utils/publicRequest'

export function upload(list, option) {
  return request({
    url: '/upload',
    method: 'post',
    data: list,
    onUploadProgress: e => {
      if (e.total > 0) {
        e.percent = e.loaded / e.total * 100
      }
      option.onProgress(e)
    }
  })
}
export function uploadMd(list) {
  return request({
    url: '/upload/local',
    method: 'post',
    data: list
  })
}
