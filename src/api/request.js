import axios from 'axios'
import setting from '@/config'
import { R_TIME, GET_STORAGE, SET_STORAGE } from '@/utils'
import { Message } from 'element-ui'

// 单点登录成功后的返回地址（process.env.RELEASE_ENV为当前部署环境： test测试环境  pro正式环境）
const redictUrl = process.env.RELEASE_ENV === 'test' ? 'http://notice-test.zx.gz.cegn.cn/' : 'http://notice.zx.gz.cegn.cn/'

export function request (config) {
  // create an axios instance
  const service = axios.create({
    baseURL: setting.BASE_URL, // url = base url + request url
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 10000 // request timeout
  })

  // request interceptor
  service.interceptors.request.use(
    config => {
      config.validateStatus = (status) => {
        return status < 500
      }
      // 组装searchStr
      if (config.method.toLocaleLowerCase() === 'get' && !config.notGeneratorSearchStr) {
        if (!config.params.searchStr) {
          config.params = { searchStr: JSON.stringify(config.params) }
        }
      }
      if (process.env.NODE_ENV === 'development') {
        document.cookie = 'SESSION=' + 'NDk4ZWE2NjQtMTY2Mi00NmY5LTg0YmMtOWI3NzI2YTIzZGY3'
      }
      return config
    }
  )

  // response interceptor
  service.interceptors.response.use(
    async response => {
      const res = response.data || response
      if (response.request.responseURL.includes('cas/login')) {
        window.location.href = `${setting.LOGIN_ADDRESS}=${redictUrl}`
      }
      if (res.status !== 0 && !response.data) {
        if (res.code === 500) {
          Message.error('系统错误')
        }
        return Promise.reject(new Error(res.message || 'Error'))
      } else {
        if (res.error) {
          const message = res.message || '操作失败！'
          Message.error(message)
          return Promise.reject(new Error(message))
        } else {
          return res
        }
      }
    },
    error => {
      return Promise.reject(error)
    }
  )
  return service(config)
}

// 检测cookie是否过期  如果过期重新获取并返回cookie
export function checkCookieOver () {
  if (parseInt(GET_STORAGE('overTime'), 0) > new Date().getTime()) {
    return false
  } else {
    return new Promise((resolve, reject) => {
      // 获取token
      request({
        url: '/api/notice/getGroup/getAuthToken',
        method: 'get',
        notGeneratorSearchStr: true
      }).then(res => {
        if (res.status === 0) {
          SET_STORAGE('token', res.data.token)
          SET_STORAGE('overTime', R_TIME(res.data.expireAt))
          resolve(res.data.token)
        }
      })
    })
  }
}
