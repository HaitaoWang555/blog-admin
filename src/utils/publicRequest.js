import axios from 'axios'
import { MessageBox, Message, Notification } from 'element-ui'
import { getToken } from '@/utils/auth'
import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API // url = base url + request url
})

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (!res.success) {
      Message({
        message: res.msg || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      // 999: 用户未登录
      // 5002: token 已过期
      // 重新登录状态码
      if ([999, 5002].includes(res.code)) {
        // to re-login
        MessageBox.confirm('登录已过期，您可以取消以保留在该页面上，或者再次登录', '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return null
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    const message = error.response && error.response.data.msg
      ? error.response.data.msg
      : error.message
    Notification({
      message: message,
      title: `服务出错，请稍后重试`,
      type: 'error',
      duration: 0
    })
    return null
  }
)

export default service
