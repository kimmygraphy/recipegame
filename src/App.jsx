import { useEffect, useMemo, useState } from 'react'
import { loadData, saveData, clearData } from './lib/data'
import { makeOrder, newCupInput } from './lib/order'
import { gradeOrder, packagingOptions } from './lib/grade'
import DataScreen from './components/DataScreen'
import Ticket from './components/Ticket'
import CupForm from './components/CupForm'
import Packaging from './components/Packaging'
import ResultView from './components/ResultView'

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [showData, setShowData] = useState(false)
  const [order, setOrder] = useState(null)
  const [inputs, setInputs] = useState([])
  const [orderPack, setOrderPack] = useState([])
  const [active, setActive] = useState(0)
  const [result, setResult] = useState(null)

  const menusById = useMemo(() => Object.fromEntries((data?.menus || []).map((m) => [m.id, m])), [data])

  function startOrder(d = data) {
    const o = makeOrder(d)
    setOrder(o)
    setInputs(o.cups.map(() => newCupInput()))
    setOrderPack([])
    setActive(0)
    setResult(null)
  }

  useEffect(() => {
    if (data && !order) startOrder(data)
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleLoad(d, source) {
    saveData(d, source)
    const next = { ...d, _source: source }
    setData(next)
    setShowData(false)
    startOrder(next)
  }

  function handleClear() {
    clearData()
    setData(null)
    setOrder(null)
    setShowData(false)
  }

  if (!data || showData) {
    return (
      <DataScreen
        current={data}
        onLoad={handleLoad}
        onClear={handleClear}
        onBack={data ? () => setShowData(false) : null}
      />
    )
  }
  if (!order) return null

  const packed = order.type.group !== 'dinein'
  const options = packagingOptions(data)
  const updateCup = (i, patch) => setInputs((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)))

  return (
    <div className="app">
      <header className="topbar">
        <h1>레시피 연습</h1>
        <button className="link" onClick={() => setShowData(true)}>
          데이터
        </button>
      </header>

      <Ticket
        order={order}
        menusById={menusById}
        active={active}
        onSelect={(i) => {
          setActive(i)
          if (result) document.getElementById(`cup-result-${i}`)?.scrollIntoView({ behavior: 'smooth' })
        }}
        inputs={inputs}
        result={result}
      />

      {result ? (
        <ResultView
          data={data}
          result={result}
          packed={packed}
          onRetry={() => setResult(null)}
          onNext={() => startOrder()}
        />
      ) : (
        <>
          <CupForm
            data={data}
            index={active}
            menu={menusById[order.cups[active].menuId]}
            cup={order.cups[active]}
            input={inputs[active]}
            packOptions={packed ? options.cup : null}
            onChange={(patch) => updateCup(active, patch)}
          />
          {packed && (
            <Packaging
              title="주문 전체 포장"
              hint="캐리어, 봉투처럼 주문 단위로 챙기는 것"
              options={options.order}
              value={orderPack}
              onChange={setOrderPack}
            />
          )}
          <div className="actions">
            <button
              className="primary"
              onClick={() => {
                setResult(gradeOrder(data, order, inputs, orderPack, menusById))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              채점하기
            </button>
            <button className="secondary" onClick={() => startOrder()}>
              다른 주문 받기
            </button>
          </div>
        </>
      )}
    </div>
  )
}
