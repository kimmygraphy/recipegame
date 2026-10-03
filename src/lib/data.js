// 레시피 데이터는 이 기기의 브라우저 저장소에만 보관 (서버 전송 없음)
const KEY = 'recipe-trainer:data:v1'

export function validateData(d) {
  if (!d || typeof d !== 'object') return ['JSON 파일 형식이 아니에요.']
  const errs = []
  for (const k of ['menus', 'ingredients', 'locations', 'orderTypes', 'packagingRules']) {
    if (!Array.isArray(d[k])) errs.push(`"${k}" 항목이 없어요.`)
  }
  if (errs.length) return errs
  const names = new Set(d.ingredients.map((i) => i.name))
  for (const m of d.menus) {
    if (!m.sizes?.length) errs.push(`${m.name}: 사이즈가 없어요.`)
    for (const it of m.items || []) {
      if (!names.has(it.ingredient)) errs.push(`${m.name}: "${it.ingredient}"가 재료 목록에 없어요.`)
    }
  }
  if (!d.menus.length) errs.push('메뉴가 하나도 없어요.')
  return errs.slice(0, 8)
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveData(d, source) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...d, _source: source }))
  } catch {
    /* 저장 실패해도 이번 세션에서는 사용 가능 */
  }
}

export function clearData() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

// 재료 단위: 이 메뉴 레시피에 있으면 그 단위, 없으면 다른 메뉴에서 쓰는 단위
export function unitFor(data, ingredient, menu) {
  const own = menu?.items.find((i) => i.ingredient === ingredient)
  if (own) return own.unit
  for (const m of data.menus) {
    const x = m.items.find((i) => i.ingredient === ingredient)
    if (x) return x.unit
  }
  return 'g'
}

export function formatAmount(unit, v) {
  if (v === undefined || v === null || v === '') return ''
  if (unit === 'T/t') {
    const parts = []
    if (v.T) parts.push(`${v.T}T`)
    if (v.t) parts.push(`${v.t}t`)
    return parts.join(' ') || '0'
  }
  if (unit === '-') return ''
  return unit === 'g' ? `${v}g` : `${v} ${unit}`
}
