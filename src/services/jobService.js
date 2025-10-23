import apiClient from './api.js'

// 채용공고 검색
export const searchJobs = async (params = {}) => {
  const { keyword = '', page = 1, limit = 20, category, location, experience, deadline } = params
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  
  if (keyword) queryParams.append('keyword', keyword)
  if (category) queryParams.append('category', category)
  if (location) queryParams.append('location', location)
  if (experience) queryParams.append('experience', experience)
  if (deadline) queryParams.append('deadline', deadline)
  
  const response = await apiClient.get(`/search?${queryParams}`)
  return response.data
}

// 채용공고 상세 조회
export const getJobDetail = async (id) => {
  const response = await apiClient.get(`/search/${id}`)
  return response.data
}

// 크롤링 실행
export const startCrawling = async () => {
  const response = await apiClient.post('/crawl')
  return response.data
}

// 크롤링 상태 조회
export const getCrawlingStatus = async () => {
  const response = await apiClient.get('/crawl/status')
  return response.data
}

// 크롤링 로그 조회
export const getCrawlingLogs = async () => {
  const response = await apiClient.get('/crawl/logs')
  return response.data.data.logs
}

// 실시간 크롤링 로그 조회
export const getRealtimeCrawlingLogs = async () => {
  const response = await apiClient.get('/crawl/logs/realtime')
  return response.data.data
}

// 크롤링 히스토리 조회
export const getCrawlingHistory = async () => {
  const response = await apiClient.get('/crawl/history')
  return response.data.data.history
}

// 데이터 내보내기
export const exportData = async (params = {}) => {
  const queryParams = new URLSearchParams(params)
  const response = await apiClient.get(`/export?${queryParams}`, {
    responseType: 'blob'
  })
  return response.data
}
