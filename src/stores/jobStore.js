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
      const searchParams = {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      }
      
      const response = await searchJobs(searchParams)
      
      jobs.value = response.data || []
      pagination.value = {
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 0
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
    
    try {
      const response = await getJobDetail(id)
      currentJob.value = response
    } catch (err) {
      error.value = err.message || '채용공고 상세 정보를 불러오는데 실패했습니다.'
      console.error('Error fetching job detail:', err)
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // Reset to first page when filters change
  }

  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
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
    updateFilters,
    updatePagination,
    clearFilters,
    fetchCrawlingStatus,
    executeCrawling
  }
})
