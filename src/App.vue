<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      @click="rail = false"
      @update:model-value="onDrawerChange"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        title="OKKY Jobs"
        subtitle="채용공고 관리 시스템"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :to="item.to"
          :active="isActiveRoute(item.to)"
          @click="onMenuItemClick"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- 크롤링 상태 표시 -->
      <v-chip
        v-if="crawlingStatus.isRunning"
        color="warning"
        variant="flat"
        prepend-icon="mdi-loading"
      >
        크롤링 진행 중...
      </v-chip>
      
      <v-chip
        v-else-if="crawlingStatus.lastRun"
        color="success"
        variant="flat"
        prepend-icon="mdi-check-circle"
      >
        최근 실행: {{ formatDate(crawlingStatus.lastRun) }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useJobStore } from './stores/jobStore.js'

const route = useRoute()
const jobStore = useJobStore()

const drawer = ref(true)
const rail = ref(false)

const menuItems = [
  {
    title: '대시보드',
    icon: 'mdi-view-dashboard',
    value: 'dashboard',
    to: '/dashboard'
  },
  {
    title: '채용공고 목록',
    icon: 'mdi-briefcase',
    value: 'jobs',
    to: '/jobs'
  },
  {
    title: '크롤링 관리',
    icon: 'mdi-spider-web',
    value: 'crawling',
    to: '/crawling'
  },
  {
    title: '데이터 내보내기',
    icon: 'mdi-download',
    value: 'export',
    to: '/export'
  }
]

const currentPageTitle = computed(() => {
  return route.meta?.title || 'OKKY Jobs'
})

const crawlingStatus = computed(() => jobStore.crawlingStatus)

const isActiveRoute = (path) => {
  return route.path === path
}

const onDrawerChange = (value) => {
  // 모바일에서 사이드바가 열릴 때 rail 모드 해제
  if (value && $vuetify.display.smAndDown) {
    rail.value = false
  }
}

const onMenuItemClick = () => {
  // 모바일에서 메뉴 아이템 클릭 시 사이드바 닫기
  if ($vuetify.display.smAndDown) {
    drawer.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // 크롤링 상태 초기 로드
  console.log('App.vue mounted - Vue.js 애플리케이션이 정상적으로 로드되었습니다.')
  jobStore.fetchCrawlingStatus()
})
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* 모바일에서 사이드바 오버레이 스타일 */
@media (max-width: 959px) {
  .v-navigation-drawer--temporary {
    z-index: 1000;
  }
  
  .v-navigation-drawer--temporary .v-list-item {
    padding: 12px 16px;
  }
  
  .v-navigation-drawer--temporary .v-list-item__prepend {
    margin-right: 16px;
  }
}

/* 데스크톱에서 rail 모드 스타일 */
@media (min-width: 960px) {
  .v-navigation-drawer--rail {
    width: 56px !important;
  }
  
  .v-navigation-drawer--rail .v-list-item__prepend {
    margin-right: 0;
  }
}
</style>
