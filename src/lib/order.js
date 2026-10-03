const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
let seq = 0
const uid = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`

export function makeOrder(data) {
  const type = pick(data.orderTypes)
  const count = 1 + Math.floor(Math.random() * 4) // 1~4잔
  const cups = Array.from({ length: count }, () => {
    const menu = pick(data.menus)
    return { menuId: menu.id, size: pick(menu.sizes) }
  })
  return { no: 100 + Math.floor(Math.random() * 900), type, cups }
}

export const newRow = () => ({ key: uid(), location: '', ingredient: '', amount: '', T: '', t: '' })
export const newCupInput = () => ({ rows: [newRow()], pack: [] })

export const sizeLabel = (s) => ({ single: '싱글', double: '더블' }[s] || s)
