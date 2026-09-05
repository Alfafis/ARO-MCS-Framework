import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { loginT } from '@/i18n/login'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useT(loginT)
  const { config } = usePlataformaConfig()
  const passwordChanged = Boolean((location.state as { passwordChanged?: boolean } | null)?.passwordChanged)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        backgroundImage: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${config.corPrimaria} 10%, transparent) 0%, transparent 60%)`,
      }}
    >
      {/* Card principal */}
      <div
        className="w-full max-w-[400px] bg-c-card rounded-[20px] px-8 py-9"
        style={{ boxShadow: 'var(--shadow-2)' }}
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
              className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none bg-c-surface-2"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-[11px] pl-4 pr-11 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none bg-c-surface-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-2 hover:text-c-text transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {passwordChanged && !error && (
            <p className="text-[12.5px] text-c-text-2 font-medium">{t.passwordChanged}</p>
          )}
          {error && <p className="text-[12.5px] text-error font-medium">{error}</p>}

          <Button variant="primary" type="submit" className="w-full mt-1 justify-center" disabled={loading}>
            {loading ? t.entering : t.enter}
          </Button>

          <Link
            to="/esqueci-senha"
            className="text-[12.5px] text-c-text-2 hover:text-accent transition-colors text-center mt-0.5"
          >
            {t.forgotPassword}
          </Link>
        </form>
      </div>

      <Link to="/privacidade" className="text-[12px] text-c-text-2 hover:text-accent transition-colors mt-6">
        Política de Privacidade
      </Link>
    </div>
  )
}
