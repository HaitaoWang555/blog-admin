import request from '@/utils/publicRequest'

export function upload(list, option) {
  return request({
    url: '/upload/local',
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
/**
 * MarkdownEditor 模式下 上传图片
 * @param {*} list 图片
 */
export function uploadMd(list) {
  return request({
    url: '/upload/local',
    method: 'post',
    data: list
  })
}

export function uploadArticle(list, option) {
  return request({
    url: '/article/upload',
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

export function uploadArticleDir(formData) {
  return request({
    url: '/article/uploadDir',
    method: 'post',
    data: formData
  })
}
