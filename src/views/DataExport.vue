<template>
  <div class="export-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">데이터 내보내기</h1>
      </v-col>
    </v-row>

    <!-- 내보내기 옵션 -->
    <v-card class="mb-6">
      <v-card-title>
        <v-icon class="mr-2">mdi-download</v-icon>
        내보내기 옵션
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-file-excel</v-icon>
                엑셀 파일 다운로드
              </v-card-title>
              
              <v-card-text>
                <div class="text-body-1 mb-4">
                  채용공고 데이터를 엑셀 파일(.xlsx)로 내보냅니다.
                </div>
                
                <v-form ref="excelForm">
                  <v-select
                    v-model="excelOptions.dataType"
                    :items="dataTypeOptions"
                    label="데이터 유형"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  ></v-select>
                  
                  <v-select
                    v-model="excelOptions.dateRange"
                    :items="dateRangeOptions"
                    label="날짜 범위"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  ></v-select>
                  
                  <v-checkbox
                    v-model="excelOptions.includeDetails"
                    label="상세 정보 포함"
                    density="compact"
                    class="mb-3"
                  ></v-checkbox>
                  
                  <v-btn
                    color="primary"
                    :loading="exportingExcel"
                    @click="exportToExcel"
                    prepend-icon="mdi-file-excel"
                    block
                  >
                    엑셀 파일 다운로드
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-h6">
                <v-icon class="mr-2">mdi-file-document</v-icon>
                CSV 파일 다운로드
              </v-card-title>
              
              <v-card-text>
                <div class="text-body-1 mb-4">
                  채용공고 데이터를 CSV 파일로 내보냅니다.
                </div>
                
                <v-form ref="csvForm">
                  <v-select
                    v-model="csvOptions.dataType"
                    :items="dataTypeOptions"
                    label="데이터 유형"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  ></v-select>
                  
                  <v-select
                    v-model="csvOptions.dateRange"
                    :items="dateRangeOptions"
                    label="날짜 범위"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  ></v-select>
                  
                  <v-select
                    v-model="csvOptions.encoding"
                    :items="encodingOptions"
                    label="인코딩"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  ></v-select>
                  
                  <v-btn
                    color="secondary"
                    :loading="exportingCsv"
                    @click="exportToCsv"
                    prepend-icon="mdi-file-document"
                    block
                  >
                    CSV 파일 다운로드
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 필터링된 데이터 내보내기 -->
    <v-card class="mb-6">
      <v-card-title>
        <v-icon class="mr-2">mdi-filter</v-icon>
        필터링된 데이터 내보내기
      </v-card-title>
      
      <v-card-text>
        <div class="text-body-1 mb-4">
          특정 조건에 맞는 채용공고만 선별하여 내보낼 수 있습니다.
        </div>
        
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filterOptions.keyword"
              label="키워드"
              variant="outlined"
              density="compact"
              clearable
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="filterOptions.category"
              :items="categoryOptions"
              label="카테고리"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="filterOptions.location"
              :items="locationOptions"
              label="지역"
              variant="outlined"
              density="compact"
              clearable
            ></v-select>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-select
              v-model="filterOptions.experience"
              :items="experienceOptions"
              label="경력"
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
              variant="outlined"
              @click="previewFilteredData"
              prepend-icon="mdi-eye"
              class="mr-2"
            >
              미리보기
            </v-btn>
            
            <v-btn
              color="success"
              :loading="exportingFiltered"
              @click="exportFilteredData"
              prepend-icon="mdi-download"
            >
              필터링된 데이터 내보내기
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 내보내기 히스토리 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon class="mr-2">mdi-history</v-icon>
          내보내기 히스토리
        </div>
        
        <v-btn
          icon="mdi-refresh"
          variant="text"
          @click="loadExportHistory"
          :loading="loadingHistory"
        ></v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="historyHeaders"
          :items="exportHistory"
          :loading="loadingHistory"
          class="elevation-0"
        >
          <template v-slot:item.type="{ item }">
            <v-chip
              size="small"
              :color="getTypeColor(item.type)"
              variant="outlined"
            >
              {{ item.type }}
            </v-chip>
          </template>
          
          <template v-slot:item.status="{ item }">
            <v-chip
              size="small"
              :color="getStatusColor(item.status)"
              variant="outlined"
            >
              {{ item.status }}
            </v-chip>
          </template>
          
          <template v-slot:item.recordCount="{ item }">
            {{ item.recordCount || 0 }}개
          </template>
          
          <template v-slot:item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-btn
              v-if="item.status === '완료'"
              icon="mdi-download"
              size="small"
              variant="text"
              @click="downloadFile(item.fileName)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- 미리보기 다이얼로그 -->
    <v-dialog v-model="previewDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-eye</v-icon>
          데이터 미리보기
        </v-card-title>
        
        <v-card-text>
          <div class="text-body-1 mb-4">
            필터 조건에 맞는 데이터: <strong>{{ previewData.length }}개</strong>
          </div>
          
          <v-data-table
            :headers="previewHeaders"
            :items="previewData.slice(0, 10)"
            :items-per-page="10"
            class="elevation-0"
          >
            <template v-slot:item.company="{ item }">
              <div class="font-weight-medium">{{ item.company }}</div>
            </template>
            
            <template v-slot:item.title="{ item }">
              <div class="text-body-2">{{ item.title }}</div>
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
          </v-data-table>
          
          <div v-if="previewData.length > 10" class="text-center mt-4">
            <v-chip color="info" variant="outlined">
              {{ previewData.length - 10 }}개 더 있음
            </v-chip>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="previewDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { exportData } from '../services/jobService.js'

// Form data
const excelOptions = ref({
  dataType: 'all',
  dateRange: 'all',
  includeDetails: true
})

const csvOptions = ref({
  dataType: 'all',
  dateRange: 'all',
  encoding: 'utf-8'
})

const filterOptions = ref({
  keyword: '',
  category: '',
  location: '',
  experience: ''
})

// UI state
const exportingExcel = ref(false)
const exportingCsv = ref(false)
const exportingFiltered = ref(false)
const loadingHistory = ref(false)
const previewDialog = ref(false)
const previewData = ref([])

// Data
const exportHistory = ref([])

// Options
const dataTypeOptions = [
  { title: '전체 데이터', value: 'all' },
  { title: '최근 1주일', value: 'week' },
  { title: '최근 1개월', value: 'month' },
  { title: '최근 3개월', value: 'quarter' }
]

const dateRangeOptions = [
  { title: '전체 기간', value: 'all' },
  { title: '최근 1주일', value: 'week' },
  { title: '최근 1개월', value: 'month' },
  { title: '최근 3개월', value: 'quarter' }
]

const encodingOptions = [
  { title: 'UTF-8', value: 'utf-8' },
  { title: 'EUC-KR', value: 'euc-kr' },
  { title: 'CP949', value: 'cp949' }
]

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

const historyHeaders = [
  { title: '파일명', key: 'fileName', sortable: false },
  { title: '유형', key: 'type', sortable: false },
  { title: '상태', key: 'status', sortable: false },
  { title: '레코드 수', key: 'recordCount', sortable: false },
  { title: '생성일', key: 'createdAt', sortable: false },
  { title: '액션', key: 'actions', sortable: false, width: '80px' }
]

const previewHeaders = [
  { title: '회사명', key: 'company', sortable: false },
  { title: '제목', key: 'title', sortable: false },
  { title: '카테고리', key: 'category', sortable: false },
  { title: '지역', key: 'location', sortable: false },
  { title: '경력', key: 'experience', sortable: false },
  { title: '마감일', key: 'deadline', sortable: false }
]

// Methods
const exportToExcel = async () => {
  exportingExcel.value = true
  try {
    const params = {
      format: 'excel',
      ...excelOptions.value
    }
    
    const blob = await exportData(params)
    downloadBlob(blob, `okky-jobs-${new Date().toISOString().split('T')[0]}.xlsx`)
  } catch (error) {
    console.error('엑셀 내보내기 실패:', error)
  } finally {
    exportingExcel.value = false
  }
}

const exportToCsv = async () => {
  exportingCsv.value = true
  try {
    const params = {
      format: 'csv',
      ...csvOptions.value
    }
    
    const blob = await exportData(params)
    downloadBlob(blob, `okky-jobs-${new Date().toISOString().split('T')[0]}.csv`)
  } catch (error) {
    console.error('CSV 내보내기 실패:', error)
  } finally {
    exportingCsv.value = false
  }
}

const exportFilteredData = async () => {
  exportingFiltered.value = true
  try {
    const params = {
      format: 'excel',
      ...filterOptions.value
    }
    
    const blob = await exportData(params)
    downloadBlob(blob, `okky-jobs-filtered-${new Date().toISOString().split('T')[0]}.xlsx`)
  } catch (error) {
    console.error('필터링된 데이터 내보내기 실패:', error)
  } finally {
    exportingFiltered.value = false
  }
}

const previewFilteredData = async () => {
  try {
    // TODO: Implement preview API call
    // 임시 데이터
    previewData.value = [
      {
        company: '테크 컴퍼니',
        title: '프론트엔드 개발자',
        category: '개발',
        location: '서울',
        experience: '신입',
        deadline: '2024-02-15'
      },
      {
        company: '스타트업',
        title: '백엔드 개발자',
        category: '개발',
        location: '서울',
        experience: '1-3년',
        deadline: '2024-02-20'
      }
    ]
    previewDialog.value = true
  } catch (error) {
    console.error('미리보기 실패:', error)
  }
}

const loadExportHistory = async () => {
  loadingHistory.value = true
  try {
    // TODO: Implement export history API call
    // 임시 데이터
    exportHistory.value = [
      {
        id: 1,
        fileName: 'okky-jobs-2024-01-21.xlsx',
        type: 'Excel',
        status: '완료',
        recordCount: 150,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        fileName: 'okky-jobs-2024-01-20.csv',
        type: 'CSV',
        status: '완료',
        recordCount: 120,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  } catch (error) {
    console.error('내보내기 히스토리 로드 실패:', error)
  } finally {
    loadingHistory.value = false
  }
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const downloadFile = (filename) => {
  // TODO: Implement file download
  console.log('파일 다운로드:', filename)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

const getTypeColor = (type) => {
  switch (type) {
    case 'Excel': return 'success'
    case 'CSV': return 'info'
    default: return 'grey'
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
  loadExportHistory()
})
</script>

<style scoped>
.export-container {
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

.h-100 {
  height: 100%;
}
</style>

