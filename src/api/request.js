import axios from 'axios'
export function request (config) {
  const service = axios.create({
    baseURL: '/',
    withCredentials: true,
  })
  return service(config)
}
