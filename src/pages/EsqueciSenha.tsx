import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { esqueciSenhaT } from '@/i18n/esqueci-senha'
import { supabase } from '@/integrations/supabase/client'
import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

export default function EsqueciSenha() {
  const t = useT(esqueciSenhaT)
  const { config } = usePlataformaConfig()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Resultado é sempre o mesmo mostrado ao usuário (exista ou não o e-mail) —
    // evita enumeração de conta, mesmo padrão que o resetPasswordForEmail já adota no servidor.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    setLoading(false)
    setSent(true)
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

        {sent ? (
          <p className="text-[0.875rem] text-c-text-2 text-center mt-3">{t.sentMessage}</p>
        ) : (
          <>
            <p className="text-[0.8125rem] text-c-text-2 text-center mb-6">{t.subtitle}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest">
                  {t.emailLabel}
                </label>
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

              <Button variant="primary" type="submit" className="w-full mt-1 justify-center" disabled={loading}>
                {loading ? t.submitting : t.submit}
              </Button>
            </form>
          </>
        )}

        <div className="flex justify-center mt-6">
          <Link to="/login" className="text-[12.5px] text-c-text-2 hover:text-accent transition-colors">
            {t.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  )
}
