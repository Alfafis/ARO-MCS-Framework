import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string
  onChange: (v: string) => void
  isOpen: boolean
  onToggle: () => void
  id: string
}

export default function CustomSelect({ options, value, onChange, isOpen, onToggle, id }: CustomSelectProps) {
  const selected = options.find(o => o.value === value)

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        id={id}
        className="csel-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 140ms ease', flex: 'none' }}
        />
      </button>

      {/* Menu — sempre no DOM, visibilidade por opacity+scale */}
      <div
        className="csel-menu"
        role="listbox"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.97)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 140ms ease, transform 140ms ease',
        }}
      >
        {options.map(opt => (
          <div
            key={opt.value}
            role="option"
            aria-selected={opt.value === value}
            className={`csel-opt${opt.value === value ? ' selected' : ''}`}
            onClick={() => { onChange(opt.value); onToggle() }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  )
}
