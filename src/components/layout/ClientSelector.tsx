import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface ClientOption {
  id: string
  name: string
}

interface Props {
  options: ClientOption[]
  value: string
  onChange: (id: string) => void
}

export default function ClientSelector({ options, value, onChange }: Props) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, minWidth: 0 })
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.id === value) ?? options[0]

  const openMenu = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setMenuPos({
      top:      rect.bottom + 6,
      left:     rect.left,
      minWidth: Math.max(rect.width, 200),
    })
    setMounted(true)
    requestAnimationFrame(() => setOpen(true))
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    setTimeout(() => setMounted(false), 150)
  }, [])

  const toggle = useCallback(() => {
    if (mounted) closeMenu()
    else openMenu()
  }, [mounted, openMenu, closeMenu])

  useEffect(() => {
    if (!mounted) return
    function onClickOutside(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) return
      closeMenu()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [mounted, closeMenu])

  function select(id: string) {
    onChange(id)
    closeMenu()
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#ebebea] hover:bg-[#ddddd9] transition-colors duration-150 px-[10px] py-[5px] cursor-pointer"
      >
        <span className="text-[13px] font-semibold text-c-text leading-none">
          {selected?.name}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`text-c-text-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {mounted && createPortal(
        <div
          ref={menuRef}
          style={{
            position:  'fixed',
            top:       menuPos.top,
            left:      menuPos.left,
            minWidth:  menuPos.minWidth,
            width:     'max-content',
            zIndex:    9999,
            transformOrigin: 'top left',
            transition: 'opacity 140ms ease, transform 140ms ease',
            opacity:   open ? 1 : 0,
            transform: open ? 'scale(1)' : 'scale(0.95)',
          }}
          className="bg-white rounded-[14px] p-1.5 shadow-[0_16px_40px_-12px_rgba(20,21,26,0.18)]"
        >
          {options.map(opt => {
            const isSelected = opt.id === value
            return (
              <button
                key={opt.id}
                onClick={() => select(opt.id)}
                className={`
                  block w-full text-left px-3 py-1.5 rounded-[9px] text-[13px] leading-none cursor-pointer
                  transition-colors duration-100 whitespace-nowrap
                  ${isSelected
                    ? 'bg-accent-100 text-accent-700 font-bold'
                    : 'text-c-text font-medium hover:bg-[#f2f2f0]'
                  }
                `}
              >
                {opt.name}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </>
  )
}
