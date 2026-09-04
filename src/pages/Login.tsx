import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { loginT } from '@/i18n/login'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

export default function Login() {
  const navigate = useNavigate()
  const t = useT(loginT)
  const { config } = usePlataformaConfig()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    navigate('/visao-geral', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: '#f4f3f1',
        backgroundImage: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${config.corPrimaria} 10%, transparent) 0%, transparent 60%)`,
      }}
    >
      {/* Card principal */}
      <div
        className="w-full max-w-[400px] bg-c-card rounded-[20px] px-8 py-9"
        style={{ boxShadow: '0 16px 40px -12px rgba(20,21,26,.18)' }}
      >
        {/* Marca */}
        <div className="flex flex-col items-center mb-7">
          <img src={config.logoCompletoUrl} alt="Be Planned" className="w-40 object-contain mb-2" />
          <p className="text-[13px] text-c-text-2 mt-1">{t.subtitle}</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">{t.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none"
              style={{ background: '#f6f5f3' }}
            />
          </div>

          {error && <p className="text-[12.5px] text-accent font-medium">{error}</p>}

          <Button variant="primary" type="submit" className="w-full mt-1 justify-center" disabled={loading}>
            {loading ? t.entering : t.enter}
          </Button>
        </form>
      </div>

      <Link to="/privacidade" className="text-[12px] text-c-text-2 hover:text-accent transition-colors mt-6">
        Política de Privacidade
      </Link>
    </div>
  )
}
