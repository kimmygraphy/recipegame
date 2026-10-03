import { formatAmount } from '../lib/data'
import { rowAmountText } from '../lib/grade'
import { sizeLabel } from '../lib/order'

const ISSUE = { missing: '빠짐', location: '위치 틀림', amount: '양 틀림' }

function PackResult({ title, r }) {
  if (!r) return null
  return (
    <div className={`pack-result ${r.ok ? 'ok' : 'bad'}`}>
      <strong>{title}</strong>
      <span>정답: {r.expected.length ? r.expected.join(', ') : '없음'}</span>
      {r.missing.length > 0 && <span className="issue">빠짐: {r.missing.join(', ')}</span>}
      {r.extra.length > 0 && <span className="issue">불필요: {r.extra.join(', ')}</span>}
    </div>
  )
}

export default function ResultView({ data, result, packed, onRetry, onNext }) {
  const ingMap = Object.fromEntries(data.ingredients.map((i) => [i.name, i]))
  const total = result.cups.length
  const allOk = result.okCount === total && (!result.orderPack || result.orderPack.ok)

  return (
    <section className="results">
      <p className={`score ${allOk ? 'ok' : ''}`}>
        {total}잔 중 <strong>{result.okCount}잔</strong> 정답
      </p>

      {result.cups.map((c, i) => (
        <article key={i} id={`cup-result-${i}`} className={`cup-result ${c.ok ? 'ok' : 'bad'}`}>
          <h3>
            {i + 1}. {c.menu.name} <span className="size-pill">{sizeLabel(c.size)}</span>
          </h3>
          <table>
            <thead>
              <tr>
                <th>재료</th>
                <th>내 답</th>
                <th>정답</th>
              </tr>
            </thead>
            <tbody>
              {c.recipe.results.map(({ item, row, issues }, j) => {
                const info = ingMap[item.ingredient]
                const ans = item.presenceOnly ? '넣기만 하면 됨' : formatAmount(item.unit, item.amounts[c.size])
                return (
                  <tr key={j} className={issues.length ? 'bad' : 'ok'}>
                    <td>
                      {item.label}
                      {issues.length > 0 && (
                        <span className="issues">{issues.map((x) => ISSUE[x]).join(', ')}</span>
                      )}
                    </td>
                    <td>
                      {row ? (
                        <>
                          <span className={issues.includes('location') ? 'wrong' : ''}>{row.location || '위치 없음'}</span>
                          {!item.presenceOnly && (
                            <span className={issues.includes('amount') ? 'wrong' : ''}>
                              {rowAmountText(item.unit, row) || '양 없음'}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="issue-text">입력 안 함</span>
                      )}
                    </td>
                    <td>
                      <span className={info?.gradeLocation ? '' : 'muted'}>{info?.location}</span>
                      <span>{ans}</span>
                      {item.ref && <span className="ref">{item.ref}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {c.recipe.extras.length > 0 && (
            <p className="extras">
              불필요한 재료: {c.recipe.extras.map((r) => r.ingredient).join(', ')}
            </p>
          )}
          {c.recipe.notGraded.length > 0 && (
            <p className="not-graded">
              채점 안 함:{' '}
              {c.recipe.notGraded
                .map((it) => `${it.label} ${formatAmount(it.unit, it.amounts[c.size])}${it.ref ? ` (${it.ref})` : ''}`)
                .join(', ')}
            </p>
          )}
          {c.menu.note && <p className="note">{c.menu.note}</p>}
          {packed && <PackResult title="이 잔 포장" r={c.pack} />}
        </article>
      ))}

      {packed && <PackResult title="주문 전체 포장" r={result.orderPack} />}

      <div className="actions">
        <button className="primary" onClick={onNext}>
          다음 주문 받기
        </button>
        <button className="secondary" onClick={onRetry}>
          고쳐서 다시 채점
        </button>
      </div>
    </section>
  )
}
