import { groupOf, weightOf } from './settings.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
let seq = 0
const uid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`

// 그룹을 가중치대로 먼저 뽑고, 그 그룹 안에서 메뉴를 고르게 뽑음
function pickMenu(data, settings) {
  const byGroup = {}
  data.menus.forEach((m) => (byGroup[groupOf(m)] ||= []).push(m))
  const pool = Object.entries(byGroup)
    .map(([g, menus]) => ({ menus, w: weightOf(settings, g) }))
    .filter((x) => x.w > 0)
  if (!pool.length) return pick(data.menus)
  let r = Math.random() * pool.reduce((sum, x) => sum + x.w, 0)
  for (const x of pool) {
    r -= x.w
    if (r < 0) return pick(x.menus)
  }
  return pick(pool[pool.length - 1].menus)
}

export function makeOrder(data, settings) {
  const type = pick(data.orderTypes)
  const count = 1 + Math.floor(Math.random() * 4) // 1~4잔
  const cups = Array.from({ length: count }, () => {
    const menu = pickMenu(data, settings)
    return { menuId: menu.id, size: pick(menu.sizes) }
  })
  return { no: 100 + Math.floor(Math.random() * 900), type, cups }
}

export const newRow = () => ({ key: uid(), location: '', ingredient: '', amount: '', T: '', t: '' })
export const newCupInput = () => ({ rows: [newRow()], pack: [] })

export const sizeLabel = (s) => ({ single: '싱글', double: '더블' }[s] || s)
