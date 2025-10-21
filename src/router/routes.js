import Dashboard from '../views/Dashboard.vue'
import JobList from '../views/JobList.vue'
import JobDetail from '../views/JobDetail.vue'
import CrawlingManagement from '../views/CrawlingManagement.vue'
import DataExport from '../views/DataExport.vue'

export const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '대시보드' }
  },
  {
    path: '/jobs',
    name: 'JobList',
    component: JobList,
    meta: { title: '채용공고 목록' }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetail',
    component: JobDetail,
    meta: { title: '채용공고 상세' }
  },
  {
    path: '/crawling',
    name: 'CrawlingManagement',
    component: CrawlingManagement,
    meta: { title: '크롤링 관리' }
  },
  {
    path: '/export',
    name: 'DataExport',
    component: DataExport,
    meta: { title: '데이터 내보내기' }
  }
]
