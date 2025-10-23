<template>
  <div class="dashboard-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">대시보드</h1>
      </v-col>
    </v-row>

    <!-- 통계 카드 -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="mr-4">mdi-briefcase</v-icon>
              <div>
                <div class="text-h6">{{ stats.totalJobs || 0 }}</div>
                <div class="text-caption text-medium-emphasis">전체 공고 수</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="mr-4">mdi-calendar-today</v-icon>
              <div>
                <div class="text-h6">{{ stats.todayJobs || 0 }}</div>
                <div class="text-caption text-medium-emphasis">오늘 수집된 공고</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="mr-4">mdi-clock-outline</v-icon>
              <div>
                <div class="text-h6">{{ formatRelativeTime(stats.lastUpdate) }}</div>
                <div class="text-caption text-medium-emphasis">최근 업데이트</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon :color="crawlingStatus.isRunning ? 'warning' : 'success'" size="40" class="mr-4">
                {{ crawlingStatus.isRunning ? 'mdi-loading' : 'mdi-check-circle' }}
              </v-icon>
              <div>
                <div class="text-h6">{{ crawlingStatus.isRunning ? '진행 중' : '대기 중' }}</div>
                <div class="text-caption text-medium-emphasis">크롤링 상태</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 최근 수집된 공고 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-history</v-icon>
            최근 수집된 공고
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="recentJobsHeaders"
              :items="recentJobs"
              :loading="loading"
              :items-per-page="5"
              hide-default-footer
              class="elevation-0"
            >
              <template v-slot:item.company="{ item }">
                <div class="font-weight-medium">{{ item.company }}</div>
              </template>
              
              <template v-slot:item.title="{ item }">
                <router-link 
                  :to="`/jobs/${item.id}`"
                  class="text-decoration-none text-primary"
                >
                  {{ item.title }}
                </router-link>
              </template>
              
              <template v-slot:item.category="{ item }">
                <v-chip size="small" color="primary" variant="outlined">
                  {{ item.category }}
                </v-chip>
              </template>
              
              <template v-slot:item.location="{ item }">
                <v-chip size="small" color="secondary" variant="outlined">
                  {{ item.location }}
                </v-chip>
              </template>
              
              <template v-slot:item.deadline="{ item }">
                <span :class="getDeadlineClass(item.deadline, item.createdAt)">
                  {{ formatDeadline(item.deadline, item.createdAt) }}
                </span>
              </template>
              
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 크롤링 상태 모니터링 -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-spider-web</v-icon>
            크롤링 상태 모니터링
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-4">
                  <div class="text-subtitle-1 mb-2">크롤링 진행률</div>
                  <v-progress-linear
                    :model-value="crawlingStatus.progress || 0"
                    :color="crawlingStatus.isRunning ? 'primary' : 'success'"
                    height="8"
                    rounded
                  ></v-progress-linear>
                  <div class="text-caption mt-1">
                    {{ crawlingStatus.progress || 0 }}% 완료
                  </div>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="text-center">
                  <v-btn
                    color="primary"
                    :loading="crawlingStatus.isRunning"
                    :disabled="crawlingStatus.isRunning"
                    @click="executeCrawling"
                  >
                    <v-icon class="mr-2">mdi-play</v-icon>
                    크롤링 실행
                  </v-btn>
                </div>
              </v-col>
            </v-row>
            
            <!-- 크롤링 로그 -->
            <div v-if="crawlingStatus.logs && crawlingStatus.logs.length > 0" class="mt-4">
              <div class="text-subtitle-1 mb-2">최근 로그</div>
              <v-list density="compact">
                <v-list-item
                  v-for="(log, index) in crawlingStatus.logs.slice(-3)"
                  :key="index"
                  :prepend-icon="getLogIcon(log.type)"
                  :title="log.message"
                  :subtitle="formatDate(log.timestamp)"
                ></v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'
import { formatDeadline, getDeadlineClass, formatDate, formatRelativeTime } from '../utils/dateUtils.js'

const jobStore = useJobStore()

const loading = ref(false)
const stats = ref({
  totalJobs: 0,
  todayJobs: 0,
  lastUpdate: null
})

const recentJobs = ref([])
const crawlingStatus = computed(() => jobStore.crawlingStatus)
const refreshInterval = ref(null)

const recentJobsHeaders = [
  { title: '회사명', key: 'company', sortable: false },
  { title: '제목', key: 'title', sortable: false },
  { title: '카테고리', key: 'category', sortable: false },
  { title: '지역', key: 'location', sortable: false },
  { title: '마감일', key: 'deadline', sortable: false },
  { title: '등록일', key: 'createdAt', sortable: false }
]

// formatDate는 dateUtils.js에서 import

// formatLastUpdate는 formatRelativeTime으로 대체

// 날짜 관련 함수들은 dateUtils.js에서 import

const getLogIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    default: return 'mdi-information'
  }
}

const executeCrawling = async () => {
  try {
    await jobStore.executeCrawling()
    // 크롤링 실행 후 상태 업데이트
    await jobStore.fetchCrawlingStatus()
    await loadDashboardData()
    // 크롤링 시작 후 실시간 모니터링 시작
    startStatusMonitoring()
  } catch (error) {
    console.error('크롤링 실행 실패:', error)
  }
}

const startStatusMonitoring = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  refreshInterval.value = setInterval(async () => {
    if (crawlingStatus.value.isRunning) {
      // 크롤링이 실행 중이면 상태와 데이터 업데이트
      await jobStore.fetchCrawlingStatus()
      await loadDashboardData()
    } else {
      // 크롤링이 끝나면 모니터링 중지
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }, 3000) // 3초마다 상태 확인 (크롤링 관리 페이지보다 조금 느리게)
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    // 전체 공고 수를 가져오기 위해 서버에서 허용하는 limit으로 요청
    await jobStore.fetchJobs({ limit: 100 })
    
    console.log('Dashboard - pagination after fetch:', jobStore.pagination) // 디버깅용
    console.log('Dashboard - jobs length:', jobStore.jobs.length) // 디버깅용
    
    // 오늘 날짜 계산 (YYYYMMDD 형식)
    const today = new Date()
    const todayString = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0')
    
    console.log('Today string:', todayString) // 디버깅용
    
    // 통계 데이터 로드
    stats.value = {
      totalJobs: jobStore.pagination.total || jobStore.jobs.length,
      todayJobs: jobStore.jobs.filter(job => {
        const jobDate = new Date(job.createdAt)
        const jobDateString = jobDate.getFullYear().toString() + 
                             (jobDate.getMonth() + 1).toString().padStart(2, '0') + 
                             jobDate.getDate().toString().padStart(2, '0')
        return jobDateString === todayString
      }).length,
      lastUpdate: new Date().toISOString()
    }
    
    console.log('Dashboard - stats:', stats.value) // 디버깅용
    console.log('Today jobs count:', stats.value.todayJobs) // 디버깅용
    
    // 최근 공고는 5개만 표시하도록 별도로 설정
    recentJobs.value = jobStore.jobs.slice(0, 5)
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error)
    // 에러 발생 시 기본값 설정
    stats.value = {
      totalJobs: 0,
      todayJobs: 0,
      lastUpdate: new Date().toISOString()
    }
    recentJobs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('Dashboard mounted, starting data load...')
  loadDashboardData().then(() => {
    console.log('Dashboard data loaded, jobs count:', jobStore.jobs.length)
  })
  jobStore.fetchCrawlingStatus()
  
  // 크롤링이 이미 실행 중이면 모니터링 시작
  if (crawlingStatus.value.isRunning) {
    startStatusMonitoring()
  }
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 100%;
  width: 100%;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}
</style>
