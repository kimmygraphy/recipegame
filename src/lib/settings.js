// 출제 범위 설정 — 그룹별 가중치(0=끄기, 1~3배). 이 기기 브라우저에만 저장
const KEY = 'recipe-trainer:settings:v1'
export const WEIGHTS = [0, 1, 2, 3]
export const DEFAULT_GROUP = '기타 음료'

export const groupOf = (menu) => menu.group || DEFAULT_GROUP

export function groupsOf(data) {
  if (data.groups?.length) return data.groups
  return [...new Set(data.menus.map(groupOf))]
}

export function weightOf(settings, group) {
  const w = settings?.weights?.[group]
  return w === undefined ? 1 : w
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { weights: {} }
  } catch {
    return { weights: {} }
  }
}

export function saveSettings(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* 저장 실패해도 이번 세션에서는 적용 */
  }
}
