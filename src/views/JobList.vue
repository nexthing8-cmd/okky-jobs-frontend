<template>
  <div class="job-list-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">채용공고 목록</h1>
      </v-col>
    </v-row>

    <!-- 검색 및 필터 -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchKeyword"
              label="키워드 검색"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              label="카테고리"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedLocation"
              :items="locationOptions"
              label="지역"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedExperience"
              :items="experienceOptions"
              label="경력"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="selectedDeadline"
              :items="deadlineOptions"
              label="마감일"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn
              color="primary"
              @click="handleSearch"
              :loading="loading"
            >
              <v-icon class="mr-2">mdi-magnify</v-icon>
              검색
            </v-btn>
            
            <v-btn
              color="secondary"
              variant="outlined"
              class="ml-2"
              @click="clearFilters"
            >
              <v-icon class="mr-2">mdi-refresh</v-icon>
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 채용공고 목록 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <span class="text-h6">채용공고 목록</span>
          <v-chip class="ml-2" color="primary" variant="outlined">
            총 {{ pagination.total }}개
          </v-chip>
        </div>
        
        <div class="d-flex align-center">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="정렬"
            variant="outlined"
            density="compact"
            style="min-width: 150px;"
            class="mr-2"
          ></v-select>
          
          <v-btn
            icon="mdi-refresh"
            variant="text"
            @click="refreshData"
            :loading="loading"
          ></v-btn>
        </div>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        :items-per-page="pagination.limit"
        :page="pagination.page"
        :server-items-length="pagination.total"
        @update:page="handlePageChange"
        @update:items-per-page="handleItemsPerPageChange"
        class="elevation-0"
        item-key="id"
      >
        <template v-slot:item.company="{ item }">
          <div class="font-weight-medium">{{ item.company }}</div>
        </template>
        
        <template v-slot:item.title="{ item }">
          <router-link 
            :to="`/jobs/${item.id}`"
            class="text-decoration-none text-primary font-weight-medium"
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
        
        <template v-slot:item.experience="{ item }">
          <v-chip 
            size="small" 
            :color="item.experience === '신입' ? 'success' : 'warning'"
            variant="outlined"
          >
            {{ item.experience }}
          </v-chip>
        </template>
        
        <template v-slot:item.deadline="{ item }">
          <span :class="getDeadlineClass(item.deadline)">
            {{ formatDeadline(item.deadline) }}
          </span>
        </template>
        
        <template v-slot:item.views="{ item }">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-1">mdi-eye</v-icon>
            {{ item.views || 0 }}
          </div>
        </template>
        
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            @click="viewJobDetail(item.id)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '../stores/jobStore.js'

const router = useRouter()
const jobStore = useJobStore()

// Search and filter states
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedLocation = ref('')
const selectedExperience = ref('')
const selectedDeadline = ref('')
const sortBy = ref('createdAt')

// Computed properties
const jobs = computed(() => jobStore.jobs)
const loading = computed(() => jobStore.loading)
const pagination = computed(() => jobStore.pagination)

// Filter options
const categoryOptions = [
  { title: '개발', value: '개발' },
  { title: '디자인', value: '디자인' },
  { title: '기획', value: '기획' },
  { title: '마케팅', value: '마케팅' },
  { title: '영업', value: '영업' }
]

const locationOptions = [
  { title: '서울', value: '서울' },
  { title: '경기', value: '경기' },
  { title: '인천', value: '인천' },
  { title: '부산', value: '부산' },
  { title: '대구', value: '대구' },
  { title: '광주', value: '광주' },
  { title: '대전', value: '대전' },
  { title: '울산', value: '울산' },
  { title: '세종', value: '세종' },
  { title: '기타', value: '기타' }
]

const experienceOptions = [
  { title: '신입', value: '신입' },
  { title: '경력 1-3년', value: '1-3년' },
  { title: '경력 3-5년', value: '3-5년' },
  { title: '경력 5-10년', value: '5-10년' },
  { title: '경력 10년 이상', value: '10년 이상' }
]

const deadlineOptions = [
  { title: '오늘', value: 'today' },
  { title: '3일 이내', value: '3days' },
  { title: '1주일 이내', value: '1week' },
  { title: '1개월 이내', value: '1month' }
]

const sortOptions = [
  { title: '최신순', value: 'createdAt' },
  { title: '회사명순', value: 'company' },
  { title: '마감일순', value: 'deadline' },
  { title: '조회수순', value: 'views' }
]

// Table headers
const headers = [
  { title: '회사명', key: 'company', sortable: false },
  { title: '제목', key: 'title', sortable: false },
  { title: '카테고리', key: 'category', sortable: false },
  { title: '지역', key: 'location', sortable: false },
  { title: '경력', key: 'experience', sortable: false },
  { title: '마감일', key: 'deadline', sortable: false },
  { title: '조회수', key: 'views', sortable: false },
  { title: '등록일', key: 'createdAt', sortable: false },
  { title: '액션', key: 'actions', sortable: false, width: '80px' }
]

// Methods
const handleSearch = async () => {
  const filters = {
    keyword: searchKeyword.value,
    category: selectedCategory.value,
    location: selectedLocation.value,
    experience: selectedExperience.value,
    deadline: selectedDeadline.value
  }
  
  jobStore.updateFilters(filters)
  await jobStore.fetchJobs()
}

const clearFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedLocation.value = ''
  selectedExperience.value = ''
  selectedDeadline.value = ''
  sortBy.value = 'createdAt'
  
  jobStore.clearFilters()
  jobStore.fetchJobs()
}

const handlePageChange = (page) => {
  jobStore.updatePagination({ page })
  jobStore.fetchJobs()
}

const handleItemsPerPageChange = (itemsPerPage) => {
  jobStore.updatePagination({ limit: itemsPerPage, page: 1 })
  jobStore.fetchJobs()
}

const refreshData = () => {
  jobStore.fetchJobs()
}

const viewJobDetail = (id) => {
  router.push(`/jobs/${id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
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

// Watch for sort changes
watch(sortBy, () => {
  // TODO: Implement sorting logic
  console.log('Sort changed to:', sortBy.value)
})

onMounted(() => {
  jobStore.fetchJobs()
})
</script>

<style scoped>
.job-list-container {
  max-width: 100%;
  width: 100%;
}

.v-data-table {
  border-radius: 8px;
}

.v-chip {
  font-size: 0.75rem;
}
</style>
