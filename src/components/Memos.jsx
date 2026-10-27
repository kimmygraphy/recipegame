import { useState } from 'react'

const fmt = (at) => {
  const d = new Date(at)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Memos({ memos, onAdd, onEdit, onDelete }) {
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(null) // { id, text }

  return (
    <div className="memos">
      <h3>메모</h3>
      {memos.map((m) =>
        editing?.id === m.id ? (
          <div key={m.id} className="memo">
            <textarea
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              aria-label="메모 수정"
              autoFocus
            />
            <div className="memo-actions">
              <button
                className="primary"
                disabled={!editing.text.trim()}
                onClick={() => {
                  onEdit(m.id, editing.text.trim())
                  setEditing(null)
                }}
              >
                저장
              </button>
              <button className="secondary" onClick={() => setEditing(null)}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <div key={m.id} className="memo">
            <p>{m.text}</p>
            <div className="memo-foot">
              <time>{fmt(m.at)}</time>
              <button className="link" onClick={() => setEditing({ id: m.id, text: m.text })}>
                수정
              </button>
              <button className="link danger" onClick={() => window.confirm('이 메모를 삭제할까요?') && onDelete(m.id)}>
                삭제
              </button>
            </div>
          </div>
        )
      )}
      <textarea
        placeholder="예: 시럽 먼저 넣고 저어야 함"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="새 메모"
      />
      <div className="memo-actions">
        <button
          className="secondary"
          disabled={!draft.trim()}
          onClick={() => {
            onAdd(draft.trim())
            setDraft('')
          }}
        >
          메모 추가
        </button>
      </div>
    </div>
  )
}
