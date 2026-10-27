import { useMemo, useState } from 'react'
import { formatAmount } from '../lib/data'
import { sizeLabel } from '../lib/order'
import { groupOf, groupsOf } from '../lib/settings'
import { loadFavorites, saveFavorites } from '../lib/favorites'
import { loadMemos, saveMemos, newMemoId } from '../lib/memos'
import Memos from './Memos'

const norm = (s) => (s || '').replace(/\s+/g, '').toLowerCase()

export default function RecipeBook({ data, onBack }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | fav | 그룹 이름
  const [favs, setFavs] = useState(() => loadFavorites())
  const [open, setOpen] = useState(() => new Set())
  const [memos, setMemos] = useState(() => loadMemos())

  const updateMemos = (menuId, fn) => {
    const next = { ...memos, [menuId]: fn(memos[menuId] || []) }
    if (!next[menuId].length) delete next[menuId]
    setMemos(next)
    saveMemos(next)
  }

  const groups = groupsOf(data)
  const locOf = useMemo(() => Object.fromEntries(data.ingredients.map((i) => [i.name, i.location])), [data])

  const toggleFav = (id) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]
    setFavs(next)
    saveFavorites(next)
  }
  const toggleOpen = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const q = norm(query)
  const list = data.menus
    .filter((m) => (filter === 'all' ? true : filter === 'fav' ? favs.includes(m.id) : groupOf(m) === filter))
    .map((m) => {
      if (!q) return { m, hit: null }
      if (norm(m.name).includes(q) || norm(m.code).includes(q)) return { m, hit: null }
      const it = m.items.find((i) => norm(i.ingredient).includes(q))
      if (it) return { m, hit: it.ingredient }
      if ((memos[m.id] || []).some((x) => norm(x.text).includes(q))) return { m, hit: null, memoHit: true }
      return null
    })
    .filter(Boolean)

  // 전체 보기 + 검색어 없을 때만 그룹별 제목으로 나눔
  const sections =
    filter === 'all' && !q
      ? groups.map((g) => ({ title: g, rows: list.filter((x) => groupOf(x.m) === g) })).filter((s) => s.rows.length)
      : [{ title: null, rows: list }]

  return (
    <div className="app book">
      <header className="topbar">
        <h1>레시피북</h1>
        <button className="link" onClick={onBack}>
          돌아가기
        </button>
      </header>

      <div className="book-controls">
        <input
          type="search"
          placeholder="메뉴, 재료, 메모로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="레시피 검색"
        />
        <div className="chips book-filters" role="radiogroup" aria-label="카테고리">
          {[['all', '전체'], ['fav', `★ 즐겨찾기 ${favs.length}`], ...groups.map((g) => [g, g])].map(([v, label]) => (
            <label key={v} className={`chip ${filter === v ? 'is-on' : ''}`}>
              <input type="radio" name="book-filter" checked={filter === v} onChange={() => setFilter(v)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <p className="hint book-count">{list.length}개</p>
      {!list.length && (
        <p className="book-empty">{filter === 'fav' && !q ? '★를 누르면 여기에 모여요.' : '찾는 레시피가 없어요.'}</p>
      )}

      {sections.map((s) => (
        <section key={s.title || 'list'}>
          {s.title && <h2 className="book-group">{s.title}</h2>}
          {s.rows.map(({ m, hit, memoHit }) => {
            const isOpen = open.has(m.id) || (q && list.length <= 3)
            const fav = favs.includes(m.id)
            return (
              <article key={m.id} className={`book-card ${isOpen ? 'is-open' : ''}`}>
                <div className="book-head">
                  <button className="book-title" aria-expanded={isOpen} onClick={() => toggleOpen(m.id)}>
                    <span className={`temp temp-${m.temp === 'HOT' ? 'hot' : 'ice'}`}>{m.temp}</span>
                    <span className="book-name">{m.name}</span>
                    <span className="book-sizes">{m.sizes.map(sizeLabel).join(' · ')}</span>
                    {(memos[m.id] || []).length > 0 && <span className="book-memo-count">메모 {memos[m.id].length}</span>}
                    {hit && <span className="book-hit">재료: {hit}</span>}
                    {memoHit && <span className="book-hit">메모에서 찾음</span>}
                  </button>
                  <button
                    className={`star ${fav ? 'is-on' : ''}`}
                    aria-pressed={fav}
                    aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기'}
                    onClick={() => toggleFav(m.id)}
                  >
                    {fav ? '★' : '☆'}
                  </button>
                </div>

                {isOpen && (
                  <div className="book-body">
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>재료</th>
                            {m.sizes.map((sz) => (
                              <th key={sz} className="num">
                                {sizeLabel(sz)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.items.map((it, i) => (
                            <tr key={i} className={hit && it.ingredient === hit ? 'is-hit' : ''}>
                              <td>
                                <span>{it.label}</span>
                                <span className="muted small">{locOf[it.ingredient]}</span>
                                {it.ref && <span className="muted small">참고 {it.ref}</span>}
                              </td>
                              {m.sizes.map((sz) => (
                                <td key={sz} className="num">
                                  {it.presenceOnly
                                    ? '넣기'
                                    : it.amounts[sz] === undefined
                                      ? '–'
                                      : formatAmount(it.unit, it.amounts[sz])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {m.note && <p className="hint">{m.note}</p>}
                    <Memos
                      memos={memos[m.id] || []}
                      onAdd={(text) => updateMemos(m.id, (l) => [...l, { id: newMemoId(), text, at: Date.now() }])}
                      onEdit={(id, text) => updateMemos(m.id, (l) => l.map((x) => (x.id === id ? { ...x, text, at: Date.now() } : x)))}
                      onDelete={(id) => updateMemos(m.id, (l) => l.filter((x) => x.id !== id))}
                    />
                  </div>
                )}
              </article>
            )
          })}
        </section>
      ))}
    </div>
  )
}
