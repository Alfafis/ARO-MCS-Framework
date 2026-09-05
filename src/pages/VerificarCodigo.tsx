import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { verificarCodigoT } from '@/i18n/verificar-codigo'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

export default function VerificarCodigo() {
  const navigate = useNavigate()
  const t = useT(verificarCodigoT)
  const { config } = usePlataformaConfig()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    const factorId = factors?.totp[0]?.id
    if (factorsError || !factorId) {
      setError(t.genericError)
      setLoading(false)
      return
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError || !challenge) {
      setError(t.genericError)
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    })
    setLoading(false)
    if (verifyError) {
      setError(t.invalidCode)
      return
    }

    navigate('/visao-geral', { replace: true })
  }

  async function handleUseAnotherAccount() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
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

        <h1 className="text-[1.05rem] font-semibold text-c-text mb-1.5 text-center">{t.title}</h1>
        <p className="text-[0.8125rem] text-c-text-2 text-center mb-6">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="verificar-codigo-input"
              className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest"
            >
              {t.codeLabel}
            </label>
            <input
              id="verificar-codigo-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder={t.codePlaceholder}
              required
              autoFocus
              className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] font-mono tracking-[0.3em] text-center text-c-text placeholder:text-c-text-2 outline-none bg-c-surface-2"
            />
          </div>

          {error && <p className="text-[12.5px] text-error font-medium">{error}</p>}

          <Button variant="primary" type="submit" className="w-full mt-1 justify-center" disabled={loading || code.length !== 6}>
            {loading ? t.submitting : t.submit}
          </Button>

          <button
            type="button"
            onClick={handleUseAnotherAccount}
            className="text-[12.5px] text-c-text-2 hover:text-accent transition-colors text-center mt-0.5 bg-transparent border-none cursor-pointer"
          >
            {t.backToLogin}
          </button>
        </form>
      </div>
    </div>
  )
}
