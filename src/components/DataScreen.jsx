import { useRef, useState } from 'react'
import { validateData } from '../lib/data'

export default function DataScreen({ current, onLoad, onClear, onBack }) {
  const fileRef = useRef(null)
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  async function readFile(file) {
    setErrors([])
    try {
      const d = JSON.parse(await file.text())
      const errs = validateData(d)
      if (errs.length) return setErrors(errs)
      onLoad(d, 'upload')
    } catch {
      setErrors(['JSON을 읽지 못했어요. xlsx_to_json.py로 만든 파일인지 확인해 주세요.'])
    }
  }

  async function loadDemo() {
    setBusy(true)
    setErrors([])
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}demo.json`)
      onLoad(await res.json(), 'demo')
    } catch {
      setErrors(['데모 데이터를 불러오지 못했어요. 네트워크 연결을 확인해 주세요.'])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app data-screen">
      <header className="topbar">
        <h1>레시피 연습</h1>
        {onBack && (
          <button className="link" onClick={onBack}>
            돌아가기
          </button>
        )}
      </header>

      <section className="intro">
        <p>
          랜덤 주문을 받고, 잔마다 재료의 위치와 양을 입력해서 레시피를 외우는 연습 도구예요.
        </p>
        <p className="hint">
          레시피 파일은 이 기기의 브라우저에만 저장되고, 어디로도 전송되지 않아요.
        </p>
      </section>

      {current && (
        <section className="current">
          <p>
            지금 데이터: {current._source === 'demo' ? '데모' : '업로드한 파일'}, 메뉴 {current.menus.length}개
          </p>
          <button className="secondary" onClick={onClear}>
            이 기기에서 데이터 지우기
          </button>
        </section>
      )}

      <div className="actions">
        <button className="primary" onClick={() => fileRef.current?.click()}>
          레시피 JSON 올리기
        </button>
        <button className="secondary" onClick={loadDemo} disabled={busy}>
          {busy ? '불러오는 중' : '데모 데이터로 해보기'}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) readFile(f)
          e.target.value = ''
        }}
      />

      {errors.length > 0 && (
        <div className="errors" role="alert">
          <strong>파일을 쓸 수 없어요</strong>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
