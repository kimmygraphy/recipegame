export default function Packaging({ title, hint, options, value, onChange }) {
  const toggle = (item) => onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item])
  return (
    <fieldset className="packaging">
      <legend>{title}</legend>
      {hint && <p className="hint">{hint}</p>}
      <div className="chips">
        {options.map((o) => (
          <label key={o} className={`chip ${value.includes(o) ? 'is-on' : ''}`}>
            <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
