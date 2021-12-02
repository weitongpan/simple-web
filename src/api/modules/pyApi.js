import { request } from '@/api/request'


export function insert (data) {
  return request({
    url: '/api/insert',
    method: 'post',
    data
  })
}


export function count (data) {
  return request({
    url: '/api/count',
    method: 'post',
    data
  })
}



export function wordcloud (params) {
  return request({
    url: '/api/wordcloud',
    method: 'get',
    params
  })
}


export function list (params) {
  return request({
    url: '/api/list',
    method: 'get',
    params
  })
}
