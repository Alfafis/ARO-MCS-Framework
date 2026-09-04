import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Moon,
  Sun,
  Globe,
  ChevronDown,
  Check,
  Folder,
  Calendar,
  BarChart3,
  Shield,
  ArrowLeftRight,
  ArrowUpRight,
  FileText,
  Clock,
  Users,
  Triangle,
  CheckSquare,
} from 'lucide-react'
import { useTema } from '@/context/TemaContext'
import { useLang, useT } from '@/i18n/useLang'
import { landingT } from '@/i18n/landing'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'
import type { Lang } from '@/i18n/lang-context'

export default function Landing() {
  const { tema, toggleTema } = useTema()
  const { lang, setLang } = useLang()
  const t = useT(landingT)
  const { config } = usePlataformaConfig()
  const isDark = tema === 'dark'

  const [langOpen, setLangOpen] = useState(false)
  const langWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!langOpen) return
    function onDocClick(e: MouseEvent) {
      if (!langWrapRef.current?.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [langOpen])

  const langShort: Record<Lang, string> = { 'pt-BR': 'PT-BR', en: 'EN', es: 'ES' }
  const langOptions: Array<{ code: Lang; label: string }> = [
    { code: 'pt-BR', label: 'Português (Brasil)' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ]

  const painelDataMax = 18
  const painelValores = [18.0, 12.6, 7.2, 5.04, 3.24]

  return (
    <div className="min-h-screen w-full text-c-text" style={{ transition: 'background 220ms ease, color 220ms ease' }}>
      <div className="max-w-[1240px] mx-auto px-8 pb-8">
        {/* ── 1. Header ─────────────────────────────────────────── */}
        <header className="flex items-center justify-between py-[22px]">
          <Link to="/" className="flex items-center gap-2 no-underline text-c-text">
            <img
              src={config.logoIconeUrl}
              alt=""
              className="w-6 h-6 object-contain"
              aria-hidden="true"
            />
            <span className="text-[16px] font-bold tracking-[-0.01em]">Be Planned</span>
          </Link>

          <nav className="om-nav-links hidden md:flex items-center gap-8">
            <a
              href="#produto"
              className="text-[13.5px] font-medium text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navProduto}
            </a>
            <a
              href="#relatorio"
              className="text-[13.5px] font-medium text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navRelatorio}
            </a>
            <a
              href="#quem-usa"
              className="text-[13.5px] font-medium text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navQuemUsa}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLangOpen(false)
                void toggleTema()
              }}
              title={isDark ? t.themeTitleDark : t.themeTitleLight}
              aria-label={isDark ? t.themeTitleDark : t.themeTitleLight}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-c-card text-c-text border-none cursor-pointer shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] hover:-translate-y-px"
              style={{ transition: 'transform 220ms ease, box-shadow 220ms ease, background 220ms ease' }}
            >
              {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </button>

            <div className="relative" ref={langWrapRef}>
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="h-[38px] px-[14px] flex items-center gap-2 rounded-full bg-c-card text-c-text border-none cursor-pointer shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] hover:-translate-y-px text-[13px] font-medium"
                style={{ transition: 'transform 220ms ease, box-shadow 220ms ease, background 220ms ease' }}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                <Globe size={14} strokeWidth={1.8} />
                <span>{langShort[lang]}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{
                    transition: 'transform 220ms ease',
                    transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              <div
                role="listbox"
                className="absolute right-0 min-w-[180px] bg-c-card rounded-[14px] p-[6px] shadow-[var(--shadow-2)]"
                style={{
                  top: 'calc(100% + 8px)',
                  transformOrigin: 'top right',
                  transform: langOpen ? 'scale(1)' : 'scale(0.96)',
                  opacity: langOpen ? 1 : 0,
                  pointerEvents: langOpen ? 'auto' : 'none',
                  transition: 'opacity 140ms ease, transform 140ms ease',
                  zIndex: 60,
                }}
              >
                {langOptions.map((opt) => {
                  const active = opt.code === lang
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLang(opt.code)
                        setLangOpen(false)
                      }}
                      className={`w-full text-left px-[10px] py-[8px] rounded-[9px] text-[13px] border-none cursor-pointer font-[inherit] ${
                        active
                          ? 'bg-accent-100 text-accent-700 font-bold'
                          : 'bg-transparent text-c-text font-medium hover:bg-c-track'
                      }`}
                      style={{ transition: 'background 220ms ease' }}
                      role="option"
                      aria-selected={active}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <Link
              to="/login"
              className="h-[38px] px-[16px] flex items-center rounded-full bg-c-card text-c-text no-underline shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] hover:-translate-y-px text-[13.5px] font-medium"
              style={{ transition: 'transform 220ms ease, box-shadow 220ms ease, background 220ms ease' }}
            >
              {t.enter}
            </Link>
          </div>
        </header>

        {/* ── 4+5. Hero ─────────────────────────────────────────── */}
        <section
          id="produto"
          className="om-hero grid gap-4 items-stretch mt-2"
          style={{ gridTemplateColumns: '1.15fr 1fr' }}
        >
          {/* Card esquerdo — proposta de valor */}
          <div
            className="bg-c-card rounded-[var(--r-xl)] shadow-[var(--shadow-1)] border border-c-line flex flex-col justify-center gap-5"
            style={{ padding: '44px' }}
          >
            <span className="self-start inline-flex items-center px-3 py-[6px] rounded-full bg-accent-100 text-accent-700 text-[12.5px] font-semibold">
              {t.heroTag}
            </span>

            <h1
              className="font-bold text-c-text"
              style={{
                fontSize: 'clamp(34px, 4.2vw, 52px)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
              }}
            >
              {t.heroTitulo}
            </h1>

            <p className="text-[16px] text-c-text-2" style={{ lineHeight: 1.65, maxWidth: '52ch' }}>
              {t.heroParagrafo}
            </p>

            <div className="h-px bg-c-line mt-2" />

            <ul className="flex flex-col gap-[10px] list-none p-0 m-0">
              {[t.heroCheck1, t.heroCheck2, t.heroCheck3].map((txt) => (
                <li key={txt} className="flex items-start gap-2 text-[13.5px] text-c-text">
                  <Check size={15} strokeWidth={2.5} className="text-[color:var(--success)] mt-[3px] shrink-0" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card direito — amostra do painel */}
          <div
            className="bg-c-card rounded-[var(--r-xl)] shadow-[var(--shadow-1)] border border-c-line flex flex-col justify-between gap-4"
            style={{ padding: '44px' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-c-text-2">{t.painelTitulo}</span>
              <span className="inline-flex items-center px-[10px] py-[3px] rounded-full bg-c-track text-c-text-2 text-[11.5px] font-semibold">
                {t.painelBadge}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span
                className="text-[10.5px] font-semibold text-c-text-2"
                style={{ letterSpacing: '0.08em' }}
              >
                {t.painelProvisaoLabel}
              </span>
              <span
                className="font-bold text-c-text"
                style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '30px', lineHeight: 1.15 }}
              >
                {t.painelProvisaoValor}
              </span>
              <span className="text-[12.5px] text-c-text-2">
                {t.painelFaixaLabel}{' '}
                <span style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{t.painelFaixaValor}</span>
              </span>
            </div>

            <div className="h-px bg-c-line" />

            <div className="flex flex-col gap-[10px]">
              {t.painelCat.map((cat, i) => {
                const pct = Math.round((painelValores[i] / painelDataMax) * 100)
                return (
                  <div key={cat} className="grid items-center gap-2" style={{ gridTemplateColumns: '20px 1fr 62px' }}>
                    <span
                      className="text-c-text-2"
                      style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-[6px] min-w-0">
                      <span className="text-[12.5px] font-semibold text-c-text">{cat}</span>
                      <div
                        className="w-full rounded-[4px] bg-c-track overflow-hidden"
                        style={{ height: '6px' }}
                        aria-hidden="true"
                      >
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${pct}%`, transition: 'width 500ms ease' }}
                        />
                      </div>
                    </div>
                    <span
                      className="text-right font-bold text-c-text"
                      style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12.5px' }}
                    >
                      {t.painelVal[i]}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="h-px bg-c-line" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-c-text-2">{t.painelNivel}</span>
                <span className="font-semibold text-[color:var(--success)]">{t.painelNivelValor}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-c-text-2">{t.painelDesembolso}</span>
                <span className="font-semibold text-c-text">{t.painelDesembolsoValor}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-c-text-2">{t.painelUltima}</span>
                <span className="font-semibold text-c-text">{t.painelUltimaValor}</span>
              </div>
            </div>

            <span className="text-[11.5px] text-c-text-2">{t.painelNota}</span>
          </div>
        </section>

        {/* ── 6. KPIs ───────────────────────────────────────────── */}
        <section className="om-kpis grid grid-cols-4 gap-4 mt-4">
          {[
            { num: t.kpi1Num, label: t.kpi1Label, Icon: Folder },
            { num: t.kpi2Num, label: t.kpi2Label, Icon: Calendar },
            { num: t.kpi3Num, label: t.kpi3Label, Icon: BarChart3 },
            { num: t.kpi4Num, label: t.kpi4Label, Icon: Shield },
          ].map(({ num, label, Icon }) => (
            <div
              key={label}
              className="bg-c-card rounded-[var(--r-lg)] shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-3"
            >
              <span
                className="inline-flex items-center justify-center rounded-[10px] bg-accent-100 text-accent-700"
                style={{ width: '32px', height: '32px' }}
              >
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span className="text-[22px] font-bold text-c-text leading-none">{num}</span>
              <span className="text-[12.5px] text-c-text-2 leading-tight">{label}</span>
            </div>
          ))}
        </section>

        {/* ── 7. O que a Be Planned faz ─────────────────────────── */}
        <section
          className="bg-c-card rounded-[var(--r-lg)] shadow-[var(--shadow-1)] border border-c-line p-8 mt-4"
        >
          <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
            <h2 className="text-[24px] font-bold text-c-text">{t.secFuncoesTitulo}</h2>
            <span
              className="text-[11.5px] font-semibold text-c-text-2"
              style={{ letterSpacing: '0.08em' }}
            >
              {t.secFuncoesKicker}
            </span>
          </div>

          <div className="om-feat grid grid-cols-3 gap-5">
            {[
              { n: '01', titulo: t.func1Titulo, desc: t.func1Desc, Icon: Folder },
              { n: '02', titulo: t.func2Titulo, desc: t.func2Desc, Icon: ArrowLeftRight },
              { n: '03', titulo: t.func3Titulo, desc: t.func3Desc, Icon: ArrowUpRight },
              { n: '04', titulo: t.func4Titulo, desc: t.func4Desc, Icon: FileText },
              { n: '05', titulo: t.func5Titulo, desc: t.func5Desc, Icon: Clock },
            ].map(({ n, titulo, desc, Icon }) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center rounded-[10px] bg-accent-100 text-accent-700"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <span
                    className="text-c-text-2"
                    style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px' }}
                  >
                    {n}
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-c-text">{titulo}</h3>
                <p className="text-[13.5px] text-c-text-2" style={{ lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}

            <div
              className="rounded-[var(--r-md)] flex flex-col justify-center gap-3"
              style={{ background: 'var(--c-soft)', padding: '20px' }}
            >
              <h3 className="text-[16px] font-bold text-c-text">{t.conviteTitulo}</h3>
              <p className="text-[13.5px] text-c-text-2" style={{ lineHeight: 1.65 }}>
                {t.conviteDesc}
              </p>
              <Link
                to="/login"
                className="self-start h-[36px] px-[14px] flex items-center rounded-full bg-c-card text-c-text no-underline shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] hover:-translate-y-px text-[13px] font-semibold border border-c-line"
                style={{ transition: 'transform 220ms ease, box-shadow 220ms ease, background 220ms ease' }}
              >
                {t.conviteCta}
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. Entregável ─────────────────────────────────────── */}
        <section
          id="relatorio"
          className="bg-c-card rounded-[var(--r-lg)] shadow-[var(--shadow-1)] border border-c-line p-8 mt-4 flex flex-col gap-4"
        >
          <div style={{ maxWidth: '62ch' }} className="flex flex-col gap-4">
            <span className="self-start inline-flex items-center px-3 py-[6px] rounded-full bg-accent-100 text-accent-700 text-[12px] font-semibold">
              {t.entregTag}
            </span>
            <h2 className="text-[26px] font-bold text-c-text" style={{ lineHeight: 1.2 }}>
              {t.entregTitulo}
            </h2>
            <p className="text-[14px] text-c-text-2" style={{ lineHeight: 1.65 }}>
              {t.entregParagrafo}
            </p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {[t.entregCheck1, t.entregCheck2, t.entregCheck3].map((txt) => (
                <li key={txt} className="flex items-start gap-2 text-[13.5px] text-c-text">
                  <Check size={15} strokeWidth={2.5} className="text-[color:var(--success)] mt-[3px] shrink-0" />
                  <span>{txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 9. Quem usa ───────────────────────────────────────── */}
        <section id="quem-usa" className="om-3 grid grid-cols-3 gap-4 mt-4">
          {[
            { titulo: t.quem1Titulo, desc: t.quem1Desc, Icon: Users },
            { titulo: t.quem2Titulo, desc: t.quem2Desc, Icon: Triangle },
            { titulo: t.quem3Titulo, desc: t.quem3Desc, Icon: CheckSquare },
          ].map(({ titulo, desc, Icon }) => (
            <div
              key={titulo}
              className="bg-c-card rounded-[var(--r-lg)] shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-3"
            >
              <span
                className="inline-flex items-center justify-center rounded-[10px] bg-accent-100 text-accent-700"
                style={{ width: '32px', height: '32px' }}
              >
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <h3 className="text-[17px] font-bold text-c-text">{titulo}</h3>
              <p className="text-[13.5px] text-c-text-2" style={{ lineHeight: 1.65 }}>
                {desc}
              </p>
            </div>
          ))}
        </section>

        {/* ── 10. Depoimento ────────────────────────────────────── */}
        <section
          className="bg-c-card rounded-[var(--r-lg)] shadow-[var(--shadow-1)] border border-c-line flex flex-col gap-[18px] mt-4"
          style={{ padding: '40px' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="var(--accent)"
            aria-hidden="true"
          >
            <path d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7.17v-7.83H6.5c0-1.47 1.2-2.67 2.67-2.67V6H7.17zm10 0c-2.3 0-4.17 1.87-4.17 4.17V18H20v-7.83h-3.67c0-1.47 1.2-2.67 2.67-2.67V6h-1.83z" />
          </svg>
          <blockquote
            className="font-semibold text-c-text m-0 p-0"
            style={{ fontSize: 'clamp(19px, 2.2vw, 25px)', lineHeight: 1.4, maxWidth: '44ch' }}
          >
            {t.depQuote}
          </blockquote>
          <cite className="text-[13px] text-c-text-2 not-italic">{t.depAuthor}</cite>
        </section>

        {/* ── 11. CTA de fechamento ─────────────────────────────── */}
        <section
          className="rounded-[var(--r-lg)] shadow-[var(--shadow-1)] flex items-center justify-between flex-wrap gap-6 mt-4"
          style={{ background: 'var(--accent)', padding: '44px' }}
        >
          <div className="flex flex-col gap-3" style={{ maxWidth: '44ch' }}>
            <h2
              className="font-bold text-white m-0"
              style={{ fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.15 }}
            >
              {t.ctaFinalTitulo}
            </h2>
            <p
              className="text-white m-0"
              style={{ fontSize: '19px', fontWeight: 600, lineHeight: 1.4 }}
            >
              {t.ctaFinalSub}
            </p>
          </div>
        </section>

        {/* ── 12. Rodapé ────────────────────────────────────────── */}
        <footer className="flex items-center justify-between flex-wrap gap-4 text-[12.5px] text-c-text-2 pt-5 pb-8">
          <span>{t.footTexto}</span>
          <nav className="flex items-center gap-6">
            <a
              href="#produto"
              className="text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navProduto}
            </a>
            <a
              href="#relatorio"
              className="text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navRelatorio}
            </a>
            <a
              href="#quem-usa"
              className="text-c-text-2 hover:text-c-text no-underline"
              style={{ transition: 'color 220ms ease' }}
            >
              {t.navQuemUsa}
            </a>
          </nav>
        </footer>
      </div>

      {/* Colapsos responsivos — spec do md
          ≤ 1000px: hero, funções e "quem usa" colapsam
          ≤ 680px:  KPIs 2×2, funções 1 col, nav do header some */}
      <style>{`
        @media (max-width: 1000px) {
          .om-hero { grid-template-columns: 1fr !important; }
          .om-feat { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .om-3    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 680px) {
          .om-nav-links { display: none !important; }
          .om-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .om-feat { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
