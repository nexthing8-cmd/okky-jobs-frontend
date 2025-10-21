<template>
  <div class="job-detail-container">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="goBack"
            class="mr-4"
          ></v-btn>
          <h1 class="text-h4">채용공고 상세</h1>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="currentJob">
      <!-- 기본 정보 -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title class="text-h5">
            {{ currentJob.title }}
          </v-card-title>
          
          <v-card-subtitle class="text-h6 text-primary">
            {{ currentJob.company }}
          </v-card-subtitle>
          
          <v-card-text>
            <v-row class="mb-4">
              <v-col cols="12" sm="6">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-tag</v-icon>
                  <span class="font-weight-medium">카테고리:</span>
                  <v-chip class="ml-2" color="primary" variant="outlined">
                    {{ currentJob.category }}
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" sm="6">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-map-marker</v-icon>
                  <span class="font-weight-medium">지역:</span>
                  <v-chip class="ml-2" color="secondary" variant="outlined">
                    {{ currentJob.location }}
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" sm="6">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-account</v-icon>
                  <span class="font-weight-medium">경력:</span>
                  <v-chip 
                    class="ml-2" 
                    :color="currentJob.experience === '신입' ? 'success' : 'warning'"
                    variant="outlined"
                  >
                    {{ currentJob.experience }}
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" sm="6">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2">mdi-calendar-clock</v-icon>
                  <span class="font-weight-medium">마감일:</span>
                  <span 
                    class="ml-2"
                    :class="getDeadlineClass(currentJob.deadline)"
                  >
                    {{ formatDeadline(currentJob.deadline) }}
                  </span>
                </div>
              </v-col>
            </v-row>
            
            <!-- 기술 스택 -->
            <div v-if="currentJob.techStack && currentJob.techStack.length > 0" class="mb-4">
              <div class="text-subtitle-1 mb-2">
                <v-icon class="mr-2">mdi-code-tags</v-icon>
                기술 스택
              </div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="tech in currentJob.techStack"
                  :key="tech"
                  size="small"
                  color="info"
                  variant="outlined"
                >
                  {{ tech }}
                </v-chip>
              </div>
            </div>
            
            <!-- 상세 설명 -->
            <div v-if="currentJob.description" class="mb-4">
              <div class="text-subtitle-1 mb-2">
                <v-icon class="mr-2">mdi-text</v-icon>
                상세 설명
              </div>
              <div class="text-body-1" v-html="formatDescription(currentJob.description)"></div>
            </div>
            
            <!-- 요구사항 -->
            <div v-if="currentJob.requirements" class="mb-4">
              <div class="text-subtitle-1 mb-2">
                <v-icon class="mr-2">mdi-clipboard-list</v-icon>
                요구사항
              </div>
              <div class="text-body-1" v-html="formatDescription(currentJob.requirements)"></div>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-btn
              color="primary"
              variant="outlined"
              :href="currentJob.originalUrl"
              target="_blank"
              prepend-icon="mdi-open-in-new"
            >
              원본 링크
            </v-btn>
            
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-share"
              @click="shareJob"
            >
              공유
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      
      <!-- 연락처 정보 및 통계 -->
      <v-col cols="12" md="4">
        <!-- 연락처 정보 -->
        <v-card class="mb-6" v-if="currentJob.contact">
          <v-card-title>
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            연락처 정보
          </v-card-title>
          
          <v-card-text>
            <div v-if="currentJob.contact.name" class="mb-3">
              <div class="text-subtitle-2 text-medium-emphasis">담당자</div>
              <div class="text-body-1">{{ currentJob.contact.name }}</div>
            </div>
            
            <div v-if="currentJob.contact.phone" class="mb-3">
              <div class="text-subtitle-2 text-medium-emphasis">전화번호</div>
              <div class="text-body-1">
                <a :href="`tel:${currentJob.contact.phone}`" class="text-decoration-none">
                  {{ currentJob.contact.phone }}
                </a>
              </div>
            </div>
            
            <div v-if="currentJob.contact.email" class="mb-3">
              <div class="text-subtitle-2 text-medium-emphasis">이메일</div>
              <div class="text-body-1">
                <a :href="`mailto:${currentJob.contact.email}`" class="text-decoration-none">
                  {{ currentJob.contact.email }}
                </a>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- 통계 정보 -->
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            통계 정보
          </v-card-title>
          
          <v-card-text>
            <div class="mb-3">
              <div class="text-subtitle-2 text-medium-emphasis">조회수</div>
              <div class="text-h6">{{ currentJob.views || 0 }}</div>
            </div>
            
            <div class="mb-3">
              <div class="text-subtitle-2 text-medium-emphasis">등록일</div>
              <div class="text-body-1">{{ formatDate(currentJob.createdAt) }}</div>
            </div>
            
            <div v-if="currentJob.updatedAt">
              <div class="text-subtitle-2 text-medium-emphasis">수정일</div>
              <div class="text-body-1">{{ formatDate(currentJob.updatedAt) }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 에러 상태 -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()

const currentJob = computed(() => jobStore.currentJob)
const loading = computed(() => jobStore.loading)
const error = computed(() => jobStore.error)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
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

const formatDescription = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

const goBack = () => {
  router.go(-1)
}

const shareJob = () => {
  if (navigator.share) {
    navigator.share({
      title: currentJob.value.title,
      text: `${currentJob.value.company} - ${currentJob.value.title}`,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    // TODO: Show snackbar notification
  }
}

onMounted(() => {
  const jobId = route.params.id
  if (jobId) {
    jobStore.fetchJobDetail(jobId)
  }
})
</script>

<style scoped>
.job-detail-container {
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

.gap-2 {
  gap: 8px;
}
</style>
