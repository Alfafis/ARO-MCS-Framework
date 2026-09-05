import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { redefinirSenhaT } from '@/i18n/redefinir-senha'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

type LinkStatus = 'checking' | 'ready' | 'invalid'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const t = useT(redefinirSenhaT)
  const { config } = usePlataformaConfig()
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setLinkStatus('ready')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' || session) setLinkStatus('ready')
    })

    // Link de recuperação processa a sessão de forma assíncrona ao carregar —
    // dá uma folga antes de assumir "sem sessão nenhuma" = link inválido/expirado.
    const timeout = setTimeout(() => {
      if (!cancelled) setLinkStatus((current) => (current === 'checking' ? 'invalid' : current))
    }, 4000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t.tooShort)
      return
    }
    if (password !== confirmPassword) {
      setError(t.mismatch)
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(t.genericError)
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    navigate('/login', { replace: true, state: { passwordChanged: true } })
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${config.corPrimaria} 10%, transparent) 0%, transparent 60%)`,
      }}
    >
      <div className="w-full max-w-[400px] bg-c-card rounded-[20px] px-8 py-9" style={{ boxShadow: 'var(--shadow-2)' }}>
        <div className="flex flex-col items-center mb-7">
          <img src={config.logoCompletoUrl} alt="Be Planned" className="w-40 object-contain mb-2" />
        </div>

        {linkStatus === 'invalid' ? (
          <>
            <h1 className="text-[1.05rem] font-semibold text-c-text mb-1.5 text-center">{t.invalidLinkTitle}</h1>
            <p className="text-[0.8125rem] text-c-text-2 text-center mb-6">{t.invalidLinkMessage}</p>
            <Link to="/esqueci-senha">
              <Button variant="primary" className="w-full justify-center">
                {t.requestNewLink}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[1.05rem] font-semibold text-c-text mb-1.5 text-center">{t.title}</h1>
            <p className="text-[0.8125rem] text-c-text-2 text-center mb-6">{t.subtitle}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] text-c-text placeholder:text-c-text-2 outline-none bg-c-surface-2"
                />
              </div>

              {error && <p className="text-[12.5px] text-error font-medium">{error}</p>}

              <Button
                variant="primary"
                type="submit"
                className="w-full mt-1 justify-center"
                disabled={loading || linkStatus === 'checking'}
              >
                {loading ? t.submitting : t.submit}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
