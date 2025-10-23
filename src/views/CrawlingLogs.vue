<template>
  <v-container fluid class="crawling-logs-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="goBack"
            class="mr-4"
          ></v-btn>
          <h1 class="text-h4">크롤링 로그 상세</h1>
        </div>
      </v-col>
    </v-row>

    <!-- 로그 필터 및 새로고침 -->
    <v-card class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon class="mr-2">mdi-text-box-outline</v-icon>
          전체 크롤링 로그
          <v-chip
            size="small"
            color="primary"
            variant="outlined"
            class="ml-2"
          >
            총 {{ totalLogsCount }}개
          </v-chip>
        </div>
        
        <div class="d-flex align-center">
          <v-select
            v-model="selectedLogType"
            :items="logTypeOptions"
            label="로그 타입 필터"
            variant="outlined"
            density="compact"
            style="min-width: 150px;"
            class="mr-2"
            clearable
          ></v-select>
          
          <v-btn
            icon="mdi-refresh"
            variant="text"
            @click="refreshLogs"
            :loading="loadingLogs"
          ></v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <div v-if="filteredLogs && filteredLogs.length > 0">
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="(log, index) in filteredLogs"
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
                
                <div class="d-flex align-center">
                  <v-chip
                    size="small"
                    :color="getLogColor(log.type)"
                    variant="outlined"
                    class="mr-2"
                  >
                    {{ log.type }}
                  </v-chip>
                  
                  <v-chip
                    v-if="log.progress !== null && log.progress !== undefined"
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ log.progress }}%
                  </v-chip>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
        
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-text-box-outline</v-icon>
          <div class="text-h6 text-medium-emphasis mt-2">로그가 없습니다</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ selectedLogType ? '선택한 로그 타입에 해당하는 로그가 없습니다' : '크롤링을 실행하면 로그가 표시됩니다' }}
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'

const jobStore = useJobStore()
const router = useRouter()

const loadingLogs = ref(false)
const selectedLogType = ref(null)

const crawlingLogs = computed(() => jobStore.crawlingLogs)
const realtimeLogs = computed(() => jobStore.realtimeLogs)
const isRealtimeMode = computed(() => jobStore.isRealtimeMode)

// 전체 로그 (실시간 모드면 실시간 로그, 아니면 일반 로그)
const allLogs = computed(() => {
  return isRealtimeMode.value && realtimeLogs.value.length > 0 
    ? realtimeLogs.value 
    : crawlingLogs.value
})

// 전체 로그 개수
const totalLogsCount = computed(() => allLogs.value.length)

// 필터된 로그
const filteredLogs = computed(() => {
  if (!selectedLogType.value) {
    return allLogs.value
  }
  return allLogs.value.filter(log => log.type === selectedLogType.value)
})

// 로그 타입 옵션
const logTypeOptions = computed(() => {
  const types = [...new Set(allLogs.value.map(log => log.type))]
  return types.map(type => ({
    title: type,
    value: type
  }))
})

const goBack = () => {
  router.push('/crawling-management')
}

const refreshLogs = async () => {
  loadingLogs.value = true
  try {
    if (isRealtimeMode.value) {
      await jobStore.fetchRealtimeLogs()
    } else {
      await jobStore.fetchCrawlingLogs()
    }
  } catch (error) {
    console.error('로그 새로고침 실패:', error)
  } finally {
    loadingLogs.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

const getLogColor = (type) => {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    case 'progress': return 'primary'
    default: return 'grey'
  }
}

const getLogIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    case 'progress': return 'mdi-progress-clock'
    default: return 'mdi-circle'
  }
}

onMounted(() => {
  // 페이지 로드 시 최신 로그 가져오기
  if (isRealtimeMode.value) {
    jobStore.fetchRealtimeLogs()
  } else {
    jobStore.fetchCrawlingLogs()
  }
})
</script>

<style scoped>
.crawling-logs-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
