import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/useLang'
import { mfaT } from '@/i18n/mfa'
import { supabase } from '@/integrations/supabase/client'

interface Props {
  onClose: () => void
  onEnrolled: () => void
}

type Step = 'loading' | 'scan' | 'error'

export default function MfaEnrollModal({ onClose, onEnrolled }: Props) {
  const t = useT(mfaT)
  const [step, setStep] = useState<Step>('loading')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  // Ref (não state) — precisa do valor mais recente dentro do cleanup do unmount,
  // sem re-disparar o efeito de enroll a cada mudança.
  const factorIdRef = useRef('')
  const verifiedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.mfa.enroll({ factorType: 'totp' }).then(({ data, error: enrollError }) => {
      if (cancelled) return
      if (enrollError || !data) {
        setStep('error')
        return
      }
      factorIdRef.current = data.id
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setStep('scan')
    })
    return () => {
      cancelled = true
      // Modal fechado sem completar a verificação — remove o factor unverified órfão,
      // senão listFactors() no card do Perfil ignora ele (só conta 'totp' verificado),
      // mas ele fica acumulando no banco a cada tentativa abandonada.
      if (factorIdRef.current && !verifiedRef.current) {
        supabase.auth.mfa.unenroll({ factorId: factorIdRef.current })
      }
    }
  }, [])

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError('')
    setVerifying(true)

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factorIdRef.current,
    })
    if (challengeError || !challenge) {
      setError(t.invalidCode)
      setVerifying(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factorIdRef.current,
      challengeId: challenge.id,
      code,
    })
    setVerifying(false)
    if (verifyError) {
      setError(t.invalidCode)
      return
    }

    verifiedRef.current = true
    onEnrolled()
  }

  return (
    <Dialog title={t.enrollModalTitle} onClose={onClose}>
      {(close) => (
        <div className="flex flex-col gap-4">
          {step === 'error' && <p className="text-[13px] text-error font-medium">{t.enrollStartError}</p>}

          {step === 'scan' && (
            <>
              <p className="text-[13px] text-c-text-2">{t.scanInstruction}</p>
              <div className="flex justify-center bg-white rounded-[11px] p-4">
                <img src={qrCode} alt="QR code TOTP" width={180} height={180} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-c-text-2">{t.manualSecretLabel}</span>
                <code className="text-[12px] font-mono tracking-wider bg-c-surface-2 rounded-[8px] px-3 py-2 break-all">
                  {secret}
                </code>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="mfa-verify-code"
                    className="text-[12px] font-semibold text-c-text-2 uppercase tracking-widest"
                  >
                    {t.codeLabel}
                  </label>
                  <input
                    id="mfa-verify-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.codePlaceholder}
                    required
                    className="w-full rounded-[11px] px-4 py-2.5 text-[0.875rem] font-mono tracking-[0.3em] text-center text-c-text placeholder:text-c-text-2 outline-none bg-c-surface-2"
                  />
                </div>

                {error && <p className="text-[12.5px] text-error font-medium">{error}</p>}
                <p className="text-[11.5px] text-c-text-2">{t.noRecoveryWarning}</p>

                <div className="flex justify-end gap-2 mt-1">
                  <Button type="button" variant="ghost" onClick={() => close(onClose)}>
                    {t.cancelButton}
                  </Button>
                  <Button type="submit" variant="primary" disabled={verifying || code.length !== 6}>
                    {verifying ? t.verifying : t.verifyButton}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </Dialog>
  )
}
