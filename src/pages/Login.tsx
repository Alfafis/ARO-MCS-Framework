import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, TrendingUp, Users } from 'lucide-react'
import OctahedronIcon from '@/components/icons/OctahedronIcon'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/LangContext'
import { loginT } from '@/i18n/login'
import { supabase } from '@/integrations/supabase/client'

export default function Login() {
  const navigate = useNavigate()
  const t = useT(loginT)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const FEATURES = [
    { Icon: TrendingUp, label: t.feature1Label, desc: t.feature1Desc },
    { Icon: Shield,     label: t.feature2Label, desc: t.feature2Desc },
    { Icon: Users,      label: t.feature3Label, desc: t.feature3Desc },
  ]

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message.toLowerCase().includes('confirm') ? t.emailNotConfirmed : t.wrongCredentials)
      setLoading(false)
      return
    }
    navigate('/clientes', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: '#f4f3f1',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(236,48,19,0.07) 0%, transparent 60%)',
      }}
    >
      {/* Card principal */}
      <div
        className="w-full max-w-[400px] bg-white rounded-[20px] px-8 py-9"
        style={{ boxShadow: '0 16px 40px -12px rgba(20,21,26,.18)' }}
      >
        {/* Marca */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-[52px] h-[52px] rounded-full bg-accent-100 flex items-center justify-center mb-4">
            <OctahedronIcon />
          </div>
          <h1 className="text-[20px] font-bold text-c-text tracking-tight">ARO-MCS Framework</h1>
          <p className="text-[13px] text-c-text-2 mt-1">{t.subtitle}</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              autoComplete="email"
              className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none"
              style={{ background: '#f6f5f3' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none"
              style={{ background: '#f6f5f3' }}
            />
          </div>

          {error && <p className="text-[12.5px] text-accent font-medium">{error}</p>}

          <Button
            variant="primary"
            type="submit"
            className="w-full mt-1 justify-center"
            disabled={loading}
          >
            {loading ? t.entering : t.enter}
          </Button>
        </form>
      </div>

      {/* Cards de feature */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[400px] mt-4">
        {FEATURES.map(({ Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-[16px] px-4 py-3.5" style={{ boxShadow: '0 1px 2px rgba(20,21,26,.06)' }}>
            <div className="w-[26px] h-[26px] rounded-[9px] bg-accent-100 flex items-center justify-center mb-2">
              <Icon size={13} color="var(--accent-700)" strokeWidth={2} aria-hidden="true" />
            </div>
            <p className="text-[12px] font-semibold text-c-text leading-tight">{label}</p>
            <p className="text-[11px] text-c-text-2 mt-0.5 leading-tight">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
