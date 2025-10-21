/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 마감일을 포맷팅합니다.
 * deadline이 년도가 없는 경우 created_at의 년도를 기준으로 계산합니다.
 * @param {string} deadline - 마감일 (예: "10.31" 또는 "2024-10-31")
 * @param {string} createdAt - 생성일 (년도 추출용)
 * @returns {string} 포맷팅된 마감일
 */
export const formatDeadline = (deadline, createdAt) => {
  if (!deadline) return '-'
  
  // deadline이 년도가 없는 경우 (예: "10.31", "10.31(금)", "11.14(화)")
  if (deadline.match(/^\d{1,2}\.\d{1,2}(\([가-힣]\))?$/)) {
    // created_at에서 년도 추출
    const createdYear = new Date(createdAt).getFullYear()
    
    // 괄호와 요일 제거 (예: "10.31(금)" -> "10.31")
    const cleanDeadline = deadline.replace(/\([가-힣]\)/, '')
    
    // 마감일이 오늘보다 작으면 다음해로 설정
    const currentDate = new Date()
    const deadlineThisYear = new Date(`${createdYear}-${cleanDeadline.replace('.', '-')}`)
    
    // 마감일이 오늘보다 작으면 다음해로 설정
    const finalYear = deadlineThisYear < currentDate ? createdYear + 1 : createdYear
    
    return `${finalYear}. ${cleanDeadline}`
  }
  
  // 이미 년도가 포함된 경우
  const date = new Date(deadline)
  
  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    return '-'
  }
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '. ').replace(/ /g, '')
}

/**
 * 마감일의 CSS 클래스를 반환합니다.
 * @param {string} deadline - 마감일
 * @param {string} createdAt - 생성일
 * @returns {string} CSS 클래스명
 */
export const getDeadlineClass = (deadline, createdAt) => {
  if (!deadline) return ''
  
  let date
  if (deadline.match(/^\d{1,2}\.\d{1,2}(\([가-힣]\))?$/)) {
    // 년도가 없는 경우 created_at 기준으로 계산
    const createdYear = new Date(createdAt).getFullYear()
    const currentDate = new Date()
    
    // 괄호와 요일 제거 (예: "10.31(금)" -> "10.31")
    const cleanDeadline = deadline.replace(/\([가-힣]\)/, '')
    
    const deadlineThisYear = new Date(`${createdYear}-${cleanDeadline.replace('.', '-')}`)
    const finalYear = deadlineThisYear < currentDate ? createdYear + 1 : createdYear
    date = new Date(`${finalYear}-${cleanDeadline.replace('.', '-')}`)
  } else {
    date = new Date(deadline)
  }
  
  // Invalid Date 체크
  if (isNaN(date.getTime())) {
    return 'text-error'
  }
  
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-error'
  if (diffDays <= 3) return 'text-warning'
  return 'text-success'
}

/**
 * 날짜를 포맷팅합니다.
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

/**
 * 날짜와 시간을 포맷팅합니다.
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜와 시간
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

/**
 * 상대적 시간을 포맷팅합니다. (예: "3일 전", "2시간 전")
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 상대적 시간
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`
  return `${Math.floor(diffMins / 1440)}일 전`
}
