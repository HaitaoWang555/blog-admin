import axios from 'axios'
import { MessageBox, Message, Notification } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
const qs = require('qs')

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API // url = base url + request url
})
service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token --['X-Token'] as a custom key.
      // please modify it according to the actual situation.
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    if (config.method === 'post') {
      config.data = qs.stringify(config.data)
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code.
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (!res.success) {
      if (res.success !== false) return response
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
