import { Message } from 'element-ui'

export function tips(res) {
  if (!res) return
  Message({
    message: res.msg,
    type: res.success ? 'success' : 'error'
  })
}
