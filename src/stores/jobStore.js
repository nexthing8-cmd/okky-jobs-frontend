import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { searchJobs, getJobDetail, startCrawling, getCrawlingStatus } from '../services/jobService.js'

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
      error.value = err.message || '크롤링 실행에 실패했습니다.'
      throw err
    } finally {
      crawlingStatus.value.isRunning = false
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
    executeCrawling
  }
})
