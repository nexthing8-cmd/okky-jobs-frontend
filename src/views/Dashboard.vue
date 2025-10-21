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
                <div class="text-h6">{{ formatLastUpdate(stats.lastUpdate) }}</div>
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
                <span :class="getDeadlineClass(item.deadline)">
                  {{ formatDeadline(item.deadline) }}
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
import { ref, computed, onMounted } from 'vue'
import { useJobStore } from '../stores/jobStore.js'

const jobStore = useJobStore()

const loading = ref(false)
const stats = ref({
  totalJobs: 0,
  todayJobs: 0,
  lastUpdate: null
})

const recentJobs = computed(() => jobStore.jobs.slice(0, 5))
const crawlingStatus = computed(() => jobStore.crawlingStatus)

const recentJobsHeaders = [
  { title: '회사명', key: 'company', sortable: false },
  { title: '제목', key: 'title', sortable: false },
  { title: '카테고리', key: 'category', sortable: false },
  { title: '지역', key: 'location', sortable: false },
  { title: '마감일', key: 'deadline', sortable: false },
  { title: '등록일', key: 'createdAt', sortable: false }
]

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatLastUpdate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`
  return `${Math.floor(diffMins / 1440)}일 전`
}

const formatDeadline = (deadline) => {
  if (!deadline) return '-'
  const date = new Date(deadline)
  return date.toLocaleDateString('ko-KR')
}

const getDeadlineClass = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-error'
  if (diffDays <= 3) return 'text-warning'
  return 'text-success'
}

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
  } catch (error) {
    console.error('크롤링 실행 실패:', error)
  }
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    // 최근 공고 로드
    await jobStore.fetchJobs({ limit: 5 })
    
    // 통계 데이터 로드 (실제 API가 구현되면 별도 엔드포인트 호출)
    stats.value = {
      totalJobs: jobStore.pagination.total || 0,
      todayJobs: Math.floor(Math.random() * 20), // 임시 데이터
      lastUpdate: new Date().toISOString()
    }
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
  jobStore.fetchCrawlingStatus()
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
