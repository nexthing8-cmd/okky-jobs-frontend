<template>
  <div class="crawling-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">크롤링 관리</h1>
      </v-col>
    </v-row>

    <!-- 크롤링 실행 -->
    <v-card class="mb-6">
      <v-card-title>
        <v-icon class="mr-2">mdi-play-circle</v-icon>
        크롤링 실행
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <div class="text-body-1 mb-4">
              OKKY 채용공고를 수집하기 위해 크롤링을 실행합니다. 
              크롤링은 시간이 소요될 수 있으며, 진행 중에는 다른 작업을 수행할 수 있습니다.
            </div>
            
            <div class="d-flex align-center">
              <v-btn
                color="primary"
                size="large"
                :loading="crawlingStatus.isRunning"
                :disabled="crawlingStatus.isRunning"
                @click="executeCrawling"
                prepend-icon="mdi-play"
              >
                {{ crawlingStatus.isRunning ? '크롤링 진행 중...' : '크롤링 시작' }}
              </v-btn>
              
              <v-btn
                v-if="crawlingStatus.isRunning"
                color="error"
                variant="outlined"
                class="ml-2"
                @click="stopCrawling"
                prepend-icon="mdi-stop"
              >
                중지
              </v-btn>
            </div>
          </v-col>
          
          <v-col cols="12" md="4">
            <div class="text-center">
              <v-progress-circular
                v-if="crawlingStatus.isRunning"
                :model-value="crawlingStatus.progress || 0"
                size="80"
                width="8"
                color="primary"
              >
                {{ crawlingStatus.progress || 0 }}%
              </v-progress-circular>
              
              <v-icon
                v-else
                size="80"
                :color="crawlingStatus.lastRun ? 'success' : 'grey'"
              >
                {{ crawlingStatus.lastRun ? 'mdi-check-circle' : 'mdi-clock-outline' }}
              </v-icon>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 크롤링 상태 -->
    <v-card class="mb-6">
      <v-card-title>
        <v-icon class="mr-2">mdi-information</v-icon>
        크롤링 상태
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <v-icon 
                  size="40" 
                  :color="crawlingStatus.isRunning ? 'warning' : 'success'"
                  class="mb-2"
                >
                  {{ crawlingStatus.isRunning ? 'mdi-loading' : 'mdi-check-circle' }}
                </v-icon>
                <div class="text-h6">{{ crawlingStatus.isRunning ? '진행 중' : '대기 중' }}</div>
                <div class="text-caption text-medium-emphasis">현재 상태</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <v-icon size="40" color="primary" class="mb-2">mdi-percent</v-icon>
                <div class="text-h6">{{ crawlingStatus.progress || 0 }}%</div>
                <div class="text-caption text-medium-emphasis">진행률</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <v-icon size="40" color="info" class="mb-2">mdi-clock-outline</v-icon>
                <div class="text-h6">{{ formatLastRun(crawlingStatus.lastRun) }}</div>
                <div class="text-caption text-medium-emphasis">최근 실행</div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-card variant="outlined">
              <v-card-text class="text-center">
                <v-icon size="40" color="success" class="mb-2">mdi-counter</v-icon>
                <div class="text-h6">{{ crawlingStatus.totalProcessed || 0 }}</div>
                <div class="text-caption text-medium-emphasis">처리된 항목</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 크롤링 로그 -->
    <v-card class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon class="mr-2">mdi-text-box-outline</v-icon>
          크롤링 로그
        </div>
        
        <v-btn
          icon="mdi-refresh"
          variant="text"
          @click="refreshLogs"
          :loading="loadingLogs"
        ></v-btn>
      </v-card-title>
      
      <v-card-text>
        <div v-if="crawlingStatus.logs && crawlingStatus.logs.length > 0">
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="(log, index) in crawlingStatus.logs"
              :key="index"
              :dot-color="getLogColor(log.type)"
              size="small"
            >
              <template v-slot:icon>
                <v-icon :color="getLogColor(log.type)" size="small">
                  {{ getLogIcon(log.type) }}
                </v-icon>
              </template>
              
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-body-2">{{ log.message }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDate(log.timestamp) }}
                  </div>
                </div>
                
                <v-chip
                  size="small"
                  :color="getLogColor(log.type)"
                  variant="outlined"
                >
                  {{ log.type }}
                </v-chip>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
        
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-text-box-outline</v-icon>
          <div class="text-h6 text-medium-emphasis mt-2">로그가 없습니다</div>
          <div class="text-body-2 text-medium-emphasis">크롤링을 실행하면 로그가 표시됩니다</div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 크롤링 히스토리 -->
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">mdi-history</v-icon>
        크롤링 히스토리
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="historyHeaders"
          :items="crawlingHistory"
          :loading="loadingHistory"
          class="elevation-0"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="outlined"
            >
              {{ item.status }}
            </v-chip>
          </template>
          
          <template v-slot:item.duration="{ item }">
            {{ formatDuration(item.duration) }}
          </template>
          
          <template v-slot:item.processed="{ item }">
            {{ item.processed || 0 }}개
          </template>
          
          <template v-slot:item.startedAt="{ item }">
            {{ formatDate(item.startedAt) }}
          </template>
          
          <template v-slot:item.endedAt="{ item }">
            {{ item.endedAt ? formatDate(item.endedAt) : '-' }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'

const jobStore = useJobStore()

const loadingLogs = ref(false)
const loadingHistory = ref(false)
const crawlingHistory = ref([])
const refreshInterval = ref(null)

const crawlingStatus = computed(() => jobStore.crawlingStatus)

const historyHeaders = [
  { title: '상태', key: 'status', sortable: false },
  { title: '시작 시간', key: 'startedAt', sortable: false },
  { title: '종료 시간', key: 'endedAt', sortable: false },
  { title: '소요 시간', key: 'duration', sortable: false },
  { title: '처리된 항목', key: 'processed', sortable: false }
]

const executeCrawling = async () => {
  try {
    await jobStore.executeCrawling()
    // 크롤링 시작 후 상태 모니터링 시작
    startStatusMonitoring()
  } catch (error) {
    console.error('크롤링 실행 실패:', error)
  }
}

const stopCrawling = () => {
  // TODO: Implement stop crawling API call
  console.log('크롤링 중지 요청')
}

const refreshLogs = async () => {
  loadingLogs.value = true
  try {
    await jobStore.fetchCrawlingStatus()
  } catch (error) {
    console.error('로그 새로고침 실패:', error)
  } finally {
    loadingLogs.value = false
  }
}

const loadCrawlingHistory = async () => {
  loadingHistory.value = true
  try {
    // TODO: Implement crawling history API call
    // 임시 데이터
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
  } catch (error) {
    console.error('크롤링 히스토리 로드 실패:', error)
  } finally {
    loadingHistory.value = false
  }
}

const startStatusMonitoring = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  refreshInterval.value = setInterval(async () => {
    if (crawlingStatus.value.isRunning) {
      await jobStore.fetchCrawlingStatus()
    } else {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }, 2000) // 2초마다 상태 확인
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

const formatLastRun = (dateString) => {
  if (!dateString) return '없음'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`
  return `${Math.floor(diffMins / 1440)}일 전`
}

const formatDuration = (durationMs) => {
  if (!durationMs) return '-'
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}분 ${seconds}초`
}

const getLogColor = (type) => {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'grey'
  }
}

const getLogIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    default: return 'mdi-circle'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case '완료': return 'success'
    case '실패': return 'error'
    case '진행 중': return 'warning'
    default: return 'grey'
  }
}

onMounted(() => {
  jobStore.fetchCrawlingStatus()
  loadCrawlingHistory()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.crawling-container {
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

.v-timeline-item {
  padding-bottom: 8px;
}
</style>
