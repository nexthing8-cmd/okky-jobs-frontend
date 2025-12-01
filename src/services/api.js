import axios from 'axios'

// 프로덕션 환경에서는 Nginx 프록시(/api/)를 사용하고,
// 개발 환경에서는 직접 백엔드 URL을 사용
const getApiBaseUrl = () => {
  // 개발 모드 확인 (빌드 타임에 결정됨)
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD
  const envUrl = import.meta.env.VITE_API_BASE_URL
  
  // 개발 환경에서만 직접 URL 사용
  if (isDev && envUrl) {
    console.log('Development mode: Using direct API URL:', envUrl)
    return envUrl
  }
  
  // 프로덕션 환경에서는 항상 Nginx 프록시 사용
  console.log('Production mode: Using Nginx proxy /api')
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

console.log('API Service - VITE_API_BASE_URL from env:', import.meta.env.VITE_API_BASE_URL)
console.log('API Service - DEV mode:', import.meta.env.DEV)
console.log('API Service - Final API_BASE_URL:', API_BASE_URL)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL + config.url
    console.log(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`)
    console.log(`API Request - baseURL: ${config.baseURL}, url: ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const fullUrl = response.config.baseURL + response.config.url
    console.log(`API Response: ${response.status} ${fullUrl}`)
    return response
  },
  (error) => {
    const fullUrl = error.config?.baseURL + error.config?.url || 'unknown'
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: fullUrl,
      error: error
    })
    return Promise.reject(error)
  }
)

export default apiClient
