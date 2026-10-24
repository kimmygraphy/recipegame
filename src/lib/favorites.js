// 즐겨찾기한 메뉴 id 목록 — 이 기기 브라우저에만 저장
const KEY = 'recipe-trainer:favorites:v1'

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function saveFavorites(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    /* 저장 실패해도 이번 세션에서는 유지 */
  }
}
