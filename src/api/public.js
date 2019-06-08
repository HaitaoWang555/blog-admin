import request from '@/utils/request'

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
