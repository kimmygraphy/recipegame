// 레시피북 메모 — { 메뉴id: [{ id, text, at }] }, 이 기기 브라우저에만 저장
const KEY = 'recipe-trainer:memos:v1'

export function loadMemos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function saveMemos(memos) {
  try {
    localStorage.setItem(KEY, JSON.stringify(memos))
  } catch {
    /* 저장 실패해도 이번 세션에서는 유지 */
  }
}

export const newMemoId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
