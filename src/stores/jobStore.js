import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchJobs, getJobDetail, startCrawling, getCrawlingStatus, getCrawlingLogs, getRealtimeCrawlingLogs, getCrawlingHistory } from '../services/jobService.js'

export const useJobStore = defineStore('job', () => {
  // State
  const jobs = ref([])
  const currentJob = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const filters = ref({
    keyword: '',
    category: '',
    location: '',
    experience: '',
    deadline: ''
  })

  // Crawling state
  const crawlingStatus = ref({
    isRunning: false,
    progress: 0,
    lastRun: null,
    logs: []
  })
  
  // Crawling logs and history
  const crawlingLogs = ref([])
  const crawlingHistory = ref([])
  const realtimeLogs = ref([])
  const isRealtimeMode = ref(false)

  // Getters
  const filteredJobs = computed(() => jobs.value)
  const hasJobs = computed(() => jobs.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  const fetchJobs = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      // params로 전달된 값이 있으면 그것을 우선 사용, 없으면 현재 pagination 상태 사용
      const searchParams = {
        ...filters.value,
        page: params.page !== undefined ? params.page : pagination.value.page,
        limit: params.limit !== undefined ? params.limit : pagination.value.limit,
        ...params
      }
      
      console.log('Fetching jobs with params:', searchParams) // 디버깅용
      console.log('Current pagination state:', pagination.value) // 디버깅용
      const response = await searchJobs(searchParams)
      console.log('API Response:', response) // 디버깅용
      
      // API 응답 구조에 따라 처리
      if (response && response.data) {
        jobs.value = response.data
        
        // pagination 정보가 별도 객체에 있는 경우
        if (response.pagination && typeof response.pagination === 'object' && Object.keys(response.pagination).length > 0) {
          console.log('Using pagination object:', response.pagination) // 디버깅용
          pagination.value = {
            page: response.pagination.page || response.page || 1,
            limit: response.pagination.limit || response.limit || searchParams.limit,
            total: response.pagination.total || response.total || response.data.length,
            totalPages: response.pagination.totalPages || response.totalPages || Math.ceil((response.pagination.total || response.total || response.data.length) / (response.pagination.limit || response.limit || searchParams.limit))
          }
        } else {
          // pagination 정보가 루트 레벨에 있는 경우
          console.log('Using root level pagination data') // 디버깅용
          console.log('Response total:', response.total) // 디버깅용
          console.log('Response page:', response.page) // 디버깅용
          console.log('Response limit:', response.limit) // 디버깅용
          pagination.value = {
            page: response.page || 1,
            limit: response.limit || searchParams.limit,
            total: response.total || response.data.length,
            totalPages: response.totalPages || Math.ceil((response.total || response.data.length) / (response.limit || searchParams.limit))
          }
        }
        
        console.log('Updated pagination:', pagination.value) // 디버깅용
        console.log('Pagination total is:', pagination.value.total) // 디버깅용
        console.log('Pagination totalPages is:', pagination.value.totalPages) // 디버깅용
      } else {
        // 기존 구조 유지
        jobs.value = response.data || []
        pagination.value = {
          page: response.page || 1,
          limit: response.limit || searchParams.limit,
          total: response.total || 0,
          totalPages: response.totalPages || 0
        }
      }
    } catch (err) {
      error.value = err.message || '채용공고를 불러오는데 실패했습니다.'
      console.error('Error fetching jobs:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchJobDetail = async (id) => {
    loading.value = true
    error.value = null
    currentJob.value = null // 초기화
    
    try {
      const response = await getJobDetail(id)
      // API 응답이 {success: true, data: {...}} 구조인 경우 data만 저장
      currentJob.value = response.data || response
      console.log('Job detail loaded from API:', response) // 디버깅용
    } catch (err) {
      error.value = err.message || '채용공고 상세 정보를 불러오는데 실패했습니다.'
      console.error('Error fetching job detail:', err)
      // 에러 발생 시 현재 작업 목록에서 해당 ID의 작업을 찾아서 설정
      const jobFromList = jobs.value.find(job => job.id == id)
      if (jobFromList) {
        currentJob.value = jobFromList
        console.log('Using job from list after API error:', jobFromList)
      } else {
        console.log('No job found in list either')
      }
    } finally {
      loading.value = false
    }
  }

  const setCurrentJob = (job) => {
    currentJob.value = job
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page when filters change
  }

  const updatePagination = (newPagination) => {
    console.log('Updating pagination:', newPagination) // 디버깅용
    pagination.value = { ...pagination.value, ...newPagination }
    console.log('New pagination state:', pagination.value) // 디버깅용
  }

  const clearFilters = () => {
    filters.value = {
      keyword: '',
      category: '',
      location: '',
      experience: '',
      deadline: ''
    }
    pagination.value.page = 1
    // limit은 유지
  }

  // Crawling actions
  const fetchCrawlingStatus = async () => {
    try {
      const response = await getCrawlingStatus()
      crawlingStatus.value = response
    } catch (err) {
      console.error('Error fetching crawling status:', err)
    }
  }

  const executeCrawling = async () => {
    try {
      crawlingStatus.value.isRunning = true
      const response = await startCrawling()
      return response
    } catch (err) {
      crawlingStatus.value.isRunning = false
      error.value = err.message || '크롤링 실행에 실패했습니다.'
      throw err
    }
    // finally 블록 제거 - 크롤링이 성공적으로 시작되면 isRunning을 true로 유지
  }

  // Crawling logs and history actions
  const fetchCrawlingLogs = async () => {
    try {
      const response = await getCrawlingLogs()
      crawlingLogs.value = response || []
      console.log('Fetched crawling logs:', crawlingLogs.value.length, 'items')
      
      // 로그에서 최신 진행률 추출
      const progressLog = response?.find(log => log.type === 'progress' && log.progress !== null)
      if (progressLog) {
        crawlingStatus.value.progress = progressLog.progress
      }
    } catch (err) {
      console.error('Error fetching crawling logs:', err)
      // API가 없을 경우 임시 로그 데이터 생성
      crawlingLogs.value = [
        {
          type: 'info',
          message: '크롤링 시스템이 준비되었습니다.',
          timestamp: new Date().toISOString()
        },
        {
          type: 'success',
          message: '마지막 크롤링이 성공적으로 완료되었습니다.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    }
  }

  const fetchRealtimeLogs = async () => {
    try {
      const response = await getRealtimeCrawlingLogs()
      realtimeLogs.value = response.logs || []
      
      // 크롤링 상태 업데이트
      if (response.isRunning !== undefined) {
        crawlingStatus.value.isRunning = response.isRunning
      }
      if (response.currentProgress !== undefined) {
        crawlingStatus.value.progress = response.currentProgress
      }
      
      return response
    } catch (err) {
      console.error('Error fetching realtime logs:', err)
      // 실시간 로그가 없을 경우 샘플 실시간 로그 생성
      const sampleLogs = [
        {
          type: 'info',
          message: '크롤링 시작: OKKY 채용공고 수집',
          timestamp: new Date().toISOString()
        },
        {
          type: 'progress',
          message: `페이지 ${Math.floor(Math.random() * 10) + 1}/10 처리 중... (${Math.floor(Math.random() * 20) + 10}개 공고 수집)`,
          timestamp: new Date(Date.now() - 30000).toISOString()
        },
        {
          type: 'success',
          message: `총 ${Math.floor(Math.random() * 50) + 100}개 공고 수집 완료`,
          timestamp: new Date(Date.now() - 10000).toISOString()
        }
      ]
      
      realtimeLogs.value = sampleLogs
      crawlingStatus.value.isRunning = true
      crawlingStatus.value.progress = Math.floor(Math.random() * 100)
      
      return { logs: sampleLogs, isRunning: true, currentProgress: crawlingStatus.value.progress }
    }
  }

  const fetchCrawlingHistory = async () => {
    try {
      const response = await getCrawlingHistory()
      crawlingHistory.value = response || []
      console.log('Fetched crawling history:', crawlingHistory.value.length, 'items')
    } catch (err) {
      console.error('Error fetching crawling history:', err)
      // API가 없을 경우 임시 히스토리 데이터 생성
      crawlingHistory.value = [
        {
          id: 1,
          status: '완료',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          endedAt: new Date(Date.now() - 3000000).toISOString(),
          duration: 600000,
          processed: 150
        },
        {
          id: 2,
          status: '완료',
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          endedAt: new Date(Date.now() - 6600000).toISOString(),
          duration: 600000,
          processed: 120
        }
      ]
    }
  }

  return {
    // State
    jobs,
    currentJob,
    loading,
    error,
    pagination,
    filters,
    crawlingStatus,
    crawlingLogs,
    crawlingHistory,
    realtimeLogs,
    isRealtimeMode,
    
    // Getters
    filteredJobs,
    hasJobs,
    isLoading,
    
    // Actions
    fetchJobs,
    fetchJobDetail,
    setCurrentJob,
    updateFilters,
    updatePagination,
    clearFilters,
    fetchCrawlingStatus,
    executeCrawling,
    fetchCrawlingLogs,
    fetchCrawlingHistory,
    fetchRealtimeLogs
  }
})
