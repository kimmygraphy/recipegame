import { formatAmount } from './data.js'

export function amountMatches(unit, expected, row) {
  if (unit === 'T/t') {
    return Number(row.T || 0) === (expected?.T || 0) && Number(row.t || 0) === (expected?.t || 0)
  }
  if (row.amount === '' || row.amount == null) return false
  return Math.abs(Number(row.amount) - Number(expected)) < 1e-9
}

export function rowAmountText(unit, row) {
  if (unit === 'T/t') return formatAmount(unit, { T: Number(row.T || 0), t: Number(row.t || 0) })
  return row.amount === '' ? '' : formatAmount(unit, row.amount)
}

// 재료 채점: 순서 무관, 같은 재료가 여러 번 나오면(①②) 양이 맞는 것부터 짝지음
export function gradeCup(data, menu, size, rows) {
  const ingMap = Object.fromEntries(data.ingredients.map((i) => [i.name, i]))
  const expected = menu.items.filter((i) => i.gradeSizes.includes(size))
  const notGraded = menu.items.filter((i) => !i.gradeSizes.includes(size))
  const ignored = new Set(notGraded.map((i) => i.ingredient))
  const filled = rows.filter((r) => r.ingredient)

  const userBy = {}
  filled.forEach((r) => (userBy[r.ingredient] ||= []).push(r))
  const expBy = {}
  expected.forEach((e) => (expBy[e.ingredient] ||= []).push(e))

  const results = []
  const extras = []
  for (const [ing, exps] of Object.entries(expBy)) {
    const pool = [...(userBy[ing] || [])]
    const pairs = exps.map((e) => ({ e, row: null }))
    pairs.forEach((p) => {
      if (p.e.presenceOnly) return
      const i = pool.findIndex((r) => amountMatches(p.e.unit, p.e.amounts[size], r))
      if (i >= 0) p.row = pool.splice(i, 1)[0]
    })
    pairs.forEach((p) => {
      if (!p.row && pool.length) p.row = pool.shift()
    })
    pool.forEach((r) => extras.push(r))

    const info = ingMap[ing]
    pairs.forEach(({ e, row }) => {
      if (!row) return results.push({ item: e, row: null, issues: ['missing'] })
      const issues = []
      if (!e.presenceOnly && !amountMatches(e.unit, e.amounts[size], row)) issues.push('amount')
      results.push({ item: e, row, issues })
    })
  }
  filled.forEach((r) => {
    if (!expBy[r.ingredient] && !ignored.has(r.ingredient)) extras.push(r)
  })
  const ok = results.every((r) => r.issues.length === 0) && extras.length === 0
  return { results, extras, notGraded, ok }
}

function ruleMatches(when, order, menu) {
  const group = order.type.group
  if (when.orderType && !when.orderType.includes(group)) return false
  if (when.minCups && order.cups.length < when.minCups) return false
  if (when.isCoffee !== undefined && (!menu || menu.isCoffee !== when.isCoffee)) return false
  return true
}

export function packagingOptions(data) {
  const cup = new Set()
  const order = new Set()
  data.packagingRules.forEach((r) => r.items.forEach((i) => (r.scope === 'cup' ? cup : order).add(i)))
  return { cup: [...cup], order: [...order] }
}

export function expectedPackaging(data, order, menu, scope) {
  const out = new Set()
  data.packagingRules
    .filter((r) => r.scope === scope && ruleMatches(r.when, order, menu))
    .forEach((r) => r.items.forEach((i) => out.add(i)))
  return out
}

function comparePack(expected, chosen) {
  const set = new Set(chosen)
  const missing = [...expected].filter((x) => !set.has(x))
  const extra = [...set].filter((x) => !expected.has(x))
  return { expected: [...expected], missing, extra, ok: !missing.length && !extra.length }
}

export function gradeOrder(data, order, inputs, orderPack, menusById) {
  const packed = order.type.group !== 'dinein' // 매장 내 취식은 포장 채점 안 함
  const cups = order.cups.map((c, i) => {
    const menu = menusById[c.menuId]
    const recipe = gradeCup(data, menu, c.size, inputs[i].rows)
    const pack = packed ? comparePack(expectedPackaging(data, order, menu, 'cup'), inputs[i].pack) : null
    return { menu, size: c.size, recipe, pack, ok: recipe.ok && (!pack || pack.ok) }
  })
  const orderPackResult = packed ? comparePack(expectedPackaging(data, order, null, 'order'), orderPack) : null
  return { cups, orderPack: orderPackResult, okCount: cups.filter((c) => c.ok).length }
}
