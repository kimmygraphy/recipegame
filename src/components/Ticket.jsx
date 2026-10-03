import { sizeLabel } from '../lib/order'

const GROUP_TAG = { dinein: '매장', takeout: '포장', delivery: '배달' }

export default function Ticket({ order, menusById, active, onSelect, inputs, result }) {
  return (
    <section className="ticket" aria-label="주문서">
      <div className="ticket-head">
        <span className={`stamp stamp-${order.type.group}`}>{GROUP_TAG[order.type.group]}</span>
        <div className="ticket-meta">
          <strong>주문 {order.no}</strong>
          <span>{order.type.label}</span>
        </div>
        <span className="ticket-count">{order.cups.length}잔</span>
      </div>
      <ol className="ticket-lines">
        {order.cups.map((c, i) => {
          const menu = menusById[c.menuId]
          const filled = inputs[i]?.rows.filter((r) => r.ingredient).length || 0
          const r = result?.cups[i]
          return (
            <li key={i}>
              <button
                className={`ticket-line ${i === active ? 'is-active' : ''}`}
                onClick={() => onSelect(i)}
                aria-current={i === active}
              >
                <span className="line-no">{i + 1}</span>
                <span className="line-name">{menu.name}</span>
                <span className="line-size">{sizeLabel(c.size)}</span>
                <span className="line-state">
                  {r ? (
                    <span className={r.ok ? 'mark-ok' : 'mark-bad'}>{r.ok ? '정답' : '오답'}</span>
                  ) : filled ? (
                    <span className="mark-progress">{filled}개 입력</span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
