# 🎯 OKKY Jobs Frontend

OKKY 채용공고 크롤링 데이터를 시각적으로 조회하고 관리할 수 있는 사용자 친화적인 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Frontend**: Vue.js 3 + Composition API
- **UI Framework**: Vuetify 3 (Material Design)
- **HTTP Client**: Axios
- **State Management**: Pinia
- **Build Tool**: Vite
- **Routing**: Vue Router 4

## 📋 주요 기능

### 1. 대시보드
- 채용공고 통계 카드 표시 (전체 공고 수, 오늘 수집된 공고 수, 최근 업데이트 시간)
- 크롤링 상태 실시간 모니터링
- 최근 수집된 공고 미리보기 (5개)

### 2. 채용공고 목록
- 채용공고 목록 조회 및 표시
- 키워드 검색 및 카테고리별 필터링
- 페이지네이션 (20개씩)
- 정렬 (최신순, 회사명순, 마감일순)

### 3. 채용공고 상세
- 개별 채용공고 상세 정보 표시
- 연락처 정보 (이름, 전화번호, 이메일)
- 상세 설명 및 요구사항
- 기술 스택 태그
- 원본 링크

### 4. 크롤링 관리
- 수동 크롤링 실행
- 크롤링 상태 실시간 확인 (진행률, 처리된 항목 수)
- 크롤링 로그 조회 (최근 5개 미리보기)
- 크롤링 히스토리 (실행 이력)
- 실시간 크롤링 모니터링 (2초 간격 자동 업데이트)

### 5. 크롤링 로그 상세
- 전체 크롤링 로그 타임라인 표시
- 로그 타입별 필터링 (success, info, progress, error, warning)
- 진행률이 포함된 로그 별도 표시
- 실시간 로그 업데이트

### 6. 데이터 내보내기
- 엑셀 파일 다운로드
- CSV 파일 다운로드
- 필터링된 데이터 내보내기
- 내보내기 히스토리

## 🔌 API 연동

### Base URL
```
https://job.your-domain.com
```

### 주요 엔드포인트
- `GET /search` - 채용공고 검색
- `GET /search/{id}` - 채용공고 상세
- `POST /crawl` - 크롤링 실행
- `GET /crawl/status` - 크롤링 상태
- `GET /crawl/logs` - 크롤링 로그 조회
- `GET /crawl/logs/realtime` - 실시간 크롤링 로그
- `GET /crawl/history` - 크롤링 히스토리
- `GET /export` - 데이터 내보내기

## 🎨 디자인 시스템

- **Primary Color**: #1976D2 (Blue)
- **Secondary Color**: #424242 (Dark Gray)
- **Success Color**: #4CAF50 (Green)
- **Warning Color**: #FF9800 (Orange)
- **Error Color**: #F44336 (Red)

## 📱 페이지 구조

```
/ (Dashboard)
├── /jobs (채용공고 목록)
│   └── /jobs/:id (채용공고 상세)
├── /crawling (크롤링 관리)
│   └── /crawling-logs (크롤링 로그 상세)
└── /export (데이터 내보내기)
```

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 20.19.0 이상 또는 22.12.0 이상
- npm 또는 yarn

### 프로젝트 설치

```sh
# 의존성 설치
npm install
```

### 개발 서버 실행

```sh
# 개발 서버 시작 (Hot-Reload)
npm run dev
```

### 프로덕션 빌드

```sh
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🐳 Docker 배포

### 필수 요구사항
- Docker
- Docker Compose

### 환경변수 설정

1. **환경변수 파일 생성**:
```sh
# env.example을 복사하여 .env 파일 생성
cp env.example .env
```

2. **API URL 설정** (`.env` 파일 수정):
```env
# API Configuration
VITE_API_BASE_URL=https://job.your-domain.com

# Environment
VITE_NODE_ENV=production
```

### 로컬 Docker 실행

```sh
# 자동 배포 스크립트 실행
./deploy.sh

# 또는 수동 실행
docker-compose up -d
```

### 접속 URL
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:5173/health

### Docker 명령어

```sh
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps

# 이미지 재빌드
docker-compose build --no-cache
```

## 🌐 Nginx 리버스 프록시 설정

### 설정 파일 종류

1. **`nginx-root-proxy.conf`** - 루트 패스 전용 (모든 요청을 프론트엔드로)
2. **`nginx-with-api-proxy.conf`** - API 프록시 포함 (프론트엔드 + 백엔드 API)
3. **`nginx-reverse-proxy.conf`** - 기본 설정 (API는 `/api/` 경로로)

### 루트 패스 설정 (추천)

```nginx
# nginx-root-proxy.conf 사용
upstream okky_jobs_frontend {
    server YOUR_SERVER_IP:5173;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://okky_jobs_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### API 프록시 포함 설정

```nginx
# nginx-with-api-proxy.conf 사용
upstream okky_jobs_frontend {
    server YOUR_SERVER_IP:5173;
}

upstream okky_api_backend {
    server your-api-server.com:8888;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # API 요청
    location /api/ {
        proxy_pass https://okky_api_backend/okky/;
        # ... CORS 설정
    }
    
    # 프론트엔드 요청
    location / {
        proxy_pass http://okky_jobs_frontend;
        # ... 프록시 설정
    }
}
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
├── views/              # 페이지 컴포넌트
│   ├── Dashboard.vue
│   ├── JobList.vue
│   ├── JobDetail.vue
│   ├── CrawlingManagement.vue
│   ├── CrawlingLogs.vue
│   └── DataExport.vue
├── stores/             # Pinia 스토어
│   └── jobStore.js
├── services/           # API 서비스
│   ├── api.js
│   └── jobService.js
├── router/             # 라우팅 설정
│   ├── index.js
│   └── routes.js
├── composables/        # Vue 컴포저블
├── utils/              # 유틸리티 함수
└── assets/             # 정적 자산
```

## 🔧 주요 설정

### Vuetify 테마 설정
- Material Design 3 기반
- 커스텀 컬러 팔레트 적용
- 반응형 디자인 지원

### API 클라이언트 설정
- Axios 기반 HTTP 클라이언트
- 요청/응답 인터셉터 설정
- 에러 핸들링

### 상태 관리
- Pinia를 사용한 전역 상태 관리
- 채용공고 데이터, 크롤링 상태 관리

## 🆕 최신 기능 (v1.1.0)

### 실시간 크롤링 모니터링
- 크롤링 실행 시 2초 간격 자동 상태 업데이트
- 실시간 진행률 표시 (0-100%)
- 처리된 항목 수 실시간 카운트

### 스마트 로그 관리
- **최근 5개 로그 미리보기**: 메인 페이지에서 핵심 정보만 표시
- **상세보기 기능**: 전체 로그를 별도 페이지에서 확인
- **로그 타입별 필터링**: success, info, progress, error, warning
- **진행률 표시**: progress 타입 로그의 진행률 별도 표시

### 향상된 사용자 경험
- 스크롤 길이 최적화 (최근 5개만 표시)
- 직관적인 네비게이션 (뒤로가기 버튼)
- 실시간 데이터 업데이트
- 반응형 디자인 개선

## 🌐 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 성능 목표

- 초기 로딩 시간 < 3초
- 페이지 전환 < 1초
- API 응답 시간 < 2초

## 🤝 기여하기

1. 프로젝트를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**작성일**: 2025-10-23  
**버전**: 1.1.0  
**작성자**: AI Assistant
