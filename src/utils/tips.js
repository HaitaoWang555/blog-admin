import { Message } from 'element-ui'

export function tips(res) {
  if (!res) return
  Message({
    message: res.code ? res.errMessage : res.message,
    type: res.code ? 'error' : 'success'
  })
}
