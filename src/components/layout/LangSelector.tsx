import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Globe, ChevronDown } from 'lucide-react'
import { useLang } from '@/i18n/useLang'
import type { Lang } from '@/i18n/LangContext'

const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)', short: 'PT' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'es', label: 'Español', short: 'ES' },
]

interface Props {
  ariaLabel?: string
}

export default function LangSelector({ ariaLabel = 'Language' }: Props) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.right - Math.max(rect.width, 180),
        width: Math.max(rect.width, 180),
      })
    }
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const insideBtn = btnRef.current?.contains(e.target as Node)
      const insideMenu = menuRef.current?.contains(e.target as Node)
      if (!insideBtn && !insideMenu) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = LANGUAGES.find((l) => l.code === lang)

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="inline-flex items-center gap-1.5 px-4 py-[9px] rounded-full bg-c-card border border-c-line shadow-[var(--shadow-1)] text-[13px] font-semibold text-c-text hover:bg-c-surface-2-hover transition-colors duration-150 cursor-pointer"
      >
        <Globe size={13} strokeWidth={2} />
        {current?.short}
        <ChevronDown
          size={13}
          strokeWidth={2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 220ms ease',
          }}
        />
      </button>

      {createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            zIndex: 100,
            background: '#fff',
            border: '1px solid rgba(20,21,26,.08)',
            borderRadius: 12,
            boxShadow: '0 12px 32px -8px rgba(20,21,26,.16)',
            padding: 4,
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
            pointerEvents: open ? 'auto' : 'none',
            transformOrigin: 'top right',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              role="option"
              aria-selected={lang === code}
              onClick={() => {
                setLang(code)
                setOpen(false)
              }}
              className={[
                'w-full text-left px-3 py-2 rounded-[8px] text-[13px] cursor-pointer border-0 transition-colors duration-150',
                lang === code
                  ? 'bg-accent-100 text-accent-700 font-semibold'
                  : 'bg-transparent text-c-text hover:bg-c-surface-2-hover',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
