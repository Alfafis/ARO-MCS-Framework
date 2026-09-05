import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Eye, EyeOff, Loader2, User } from 'lucide-react'
import type { Factor } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/layout/PageHeader'
import MfaEnrollModal from '@/components/perfil/MfaEnrollModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useT } from '@/i18n/useLang'
import { perfilT } from '@/i18n/perfil'
import { mfaT } from '@/i18n/mfa'
import { trocarSenhaT } from '@/i18n/trocar-senha'
import { supabase } from '@/integrations/supabase/client'
import { formatTelefone } from '@/lib/telefone'
import type { PerfilRow } from '@/types'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

export default function Perfil() {
  const t = useT(perfilT)
  const tMfa = useT(mfaT)
  const tSenha = useT(trocarSenhaT)

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<PerfilRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exclusaoPendenteEm, setExclusaoPendenteEm] = useState<string | null>(null)

  const [totpFactor, setTotpFactor] = useState<Factor | null>(null)
  const [disablingMfa, setDisablingMfa] = useState(false)
  const [showMfaEnroll, setShowMfaEnroll] = useState(false)
  const [showDisableMfaConfirm, setShowDisableMfaConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [showSenhaFields, setShowSenhaFields] = useState(false)
  const [senhaError, setSenhaError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [nome, setNome] = useState('')
  const [profissao, setProfissao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [toast, setToast] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function carregarMfaFactors() {
    const { data } = await supabase.auth.mfa.listFactors()
    setTotpFactor(data?.totp[0] ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      setEmail(session.user.email ?? '')
      const { data } = await supabase.from('perfis').select('*').eq('id', session.user.id).single()
      if (data) {
        setPerfil(data)
        setNome(data.nome ?? '')
        setProfissao(data.profissao ?? '')
        setTelefone(data.telefone ?? '')
      }
      const { data: solicitacao } = await supabase
        .from('solicitacoes_exclusao')
        .select('criado_em')
        .eq('usuario_id', session.user.id)
        .eq('status', 'pendente')
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (solicitacao) setExclusaoPendenteEm(solicitacao.criado_em)
      await carregarMfaFactors()
      setLoading(false)
    })
  }, [])

  async function handleDisableMfa() {
    if (!totpFactor) return
    setShowDisableMfaConfirm(false)
    setDisablingMfa(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id })
      if (error) throw error
      setTotpFactor(null)
      showToast(tMfa.disableSuccessToast)
    } catch {
      showToast(tMfa.disableErrorToast)
    } finally {
      setDisablingMfa(false)
    }
  }

  function handleMfaEnrolled() {
    setShowMfaEnroll(false)
    void carregarMfaFactors()
    showToast(tMfa.enrollSuccessToast)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setSenhaError('')

    if (novaSenha.length < 8) {
      setSenhaError(tSenha.tooShort)
      return
    }
    if (novaSenha !== confirmarNovaSenha) {
      setSenhaError(tSenha.mismatch)
      return
    }

    setChangingPassword(true)
    // current_password é validado no servidor (GoTrue), não é campo decorativo — exige
    // "Secure password change" habilitado no Dashboard (Auth → Providers → Email). Sem sessão
    // nova nem downgrade de AAL, ao contrário de reautenticar via signInWithPassword (que criaria
    // uma sessão aal1 nova e derrubaria quem tem 2FA de volta pro gate de /verificar-codigo).
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
      current_password: senhaAtual,
    })
    setChangingPassword(false)

    if (error) {
      switch (error.code) {
        case 'invalid_credentials':
        case 'current_password_invalid':
          setSenhaError(tSenha.wrongCurrentPassword)
          break
        case 'same_password':
          setSenhaError(tSenha.samePassword)
          break
        case 'weak_password':
          setSenhaError(tSenha.weakPassword)
          break
        case 'reauthentication_needed':
          setSenhaError(tSenha.reauthNeeded)
          break
        default:
          setSenhaError(tSenha.genericError)
      }
      return
    }

    setSenhaAtual('')
    setNovaSenha('')
    setConfirmarNovaSenha('')
    showToast(tSenha.successToast)
  }

  async function handleExportar() {
    setExporting(true)
    try {
      const { data, error } = await supabase.rpc('exportar_meus_dados')
      if (error || !data) throw error ?? new Error('Falha ao exportar dados')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast(t.exportErrorToast)
    } finally {
      setExporting(false)
    }
  }

  async function handleSolicitarExclusao() {
    setShowDeleteConfirm(false)
    setDeleting(true)
    try {
      const { data, error } = await supabase.rpc('solicitar_exclusao_conta')
      if (error || !data) throw error ?? new Error('Falha ao solicitar exclusão')
      const criadoEm = (data as { criado_em: string }).criado_em
      setExclusaoPendenteEm(criadoEm)
      setNome('')
      setProfissao('')
      setTelefone('')
      setPerfil((p) => (p ? { ...p, nome: null, profissao: null, telefone: null, foto_url: null } : p))
      showToast(t.deleteRequestedToast)

      // Confirmação por e-mail é best-effort — a solicitação já foi registrada no
      // banco acima; falha no envio não pode reverter isso nem mostrar erro.
      if (email) {
        supabase.functions
          .invoke('send-transactional-email', {
            body: { to: email, template: 'exclusao_solicitada', data: {} },
          })
          .catch(() => {})
      }
    } catch {
      showToast(t.deleteErrorToast)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSalvar() {
    setSaving(true)
    try {
      const { data, error } = await supabase.rpc('atualizar_meu_perfil', {
        p_nome: nome,
        p_profissao: profissao,
        p_telefone: telefone,
      })
      if (error || !data) throw error ?? new Error('Falha ao salvar perfil')
      setPerfil((p) => (p ? { ...data, tema: p.tema } : { ...data, tema: 'light' }))
      window.dispatchEvent(new CustomEvent('perfil-atualizado'))
      showToast(t.savedToast)
    } catch {
      showToast(t.saveErrorToast)
    } finally {
      setSaving(false)
    }
  }

  async function limparArquivosAntigos() {
    const { data: existentes } = await supabase.storage.from('avatars').list(userId)
    if (existentes && existentes.length > 0) {
      await supabase.storage.from('avatars').remove(existentes.map((f) => `${userId}/${f.name}`))
    }
  }

  async function handleFotoSelecionada(file: File) {
    if (!file.type.startsWith('image/')) {
      showToast(t.photoTypeError)
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      showToast(t.photoSizeError)
      return
    }

    setUploading(true)
    try {
      await limparArquivosAntigos()

      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type,
      })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: rpcError } = await supabase.rpc('atualizar_foto_perfil', { p_foto_url: publicUrl })
      if (rpcError) throw rpcError

      setPerfil((p) => (p ? { ...p, foto_url: publicUrl } : p))
      window.dispatchEvent(new CustomEvent('perfil-atualizado'))
      showToast(t.savedToast)
    } catch {
      showToast(t.photoUploadErrorToast)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoverFoto() {
    setUploading(true)
    try {
      await limparArquivosAntigos()
      // p_foto_url aceita NULL em runtime (coluna nullable, sem NOT NULL na função) mas o
      // gerador de tipos do Supabase não marca arg `text` simples como nullable — mesmo padrão
      // já registrado em ProjetoContext.atualizarParametroAnual.
      const { error } = await supabase.rpc('atualizar_foto_perfil', { p_foto_url: null as unknown as string })
      if (error) throw error
      setPerfil((p) => (p ? { ...p, foto_url: null } : p))
      window.dispatchEvent(new CustomEvent('perfil-atualizado'))
      showToast(t.savedToast)
    } catch {
      showToast(t.photoRemoveErrorToast)
    } finally {
      setUploading(false)
    }
  }

  const roleLabel = perfil?.papel === 'consultor' ? t.roleConsultant : t.roleClient

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start px-4 sm:px-8 pb-8 overflow-y-auto flex-1 max-w-[960px]">
        {!loading && (
          <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-6">
            {/* Foto */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center overflow-hidden shrink-0 transition-shadow ${dragOver ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) void handleFotoSelecionada(file)
                }}
              >
                {perfil?.foto_url ? (
                  <img src={perfil.foto_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} strokeWidth={2} />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {t.photoChange}
                  </Button>
                  {perfil?.foto_url && (
                    <Button variant="link" disabled={uploading} onClick={handleRemoverFoto}>
                      {t.photoRemove}
                    </Button>
                  )}
                </div>
                <p className="text-[12px] text-c-text-2">{t.photoHint}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleFotoSelecionada(file)
                  }}
                />
              </div>
            </div>

            <div className="h-px bg-c-line" />

            {/* Campos */}
            <div className="flex flex-col gap-4">
              <div>
                <Label>{t.labelName}</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.placeholderName} />
              </div>
              <div>
                <Label>{t.labelProfession}</Label>
                <Input
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                  placeholder={t.placeholderProfession}
                />
              </div>
              <div>
                <Label>{t.labelPhone}</Label>
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  placeholder={t.placeholderPhone}
                />
              </div>
              <div>
                <Label>{t.labelEmail}</Label>
                <Input value={email} disabled />
              </div>
              <div>
                <Label>{t.labelRole}</Label>
                <div>
                  <Badge variant="accent">{roleLabel}</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" disabled={saving} onClick={handleSalvar}>
                {saving ? t.saving : t.save}
              </Button>
            </div>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6">
            <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-c-text">{tSenha.sectionTitle}</p>
                <button
                  type="button"
                  onClick={() => setShowSenhaFields((v) => !v)}
                  aria-label={showSenhaFields ? tSenha.hidePassword : tSenha.showPassword}
                  className="text-c-text-2 hover:text-c-text transition-colors cursor-pointer"
                >
                  {showSenhaFields ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              <p className="text-[12px] text-c-text-2">{tSenha.sectionDescription}</p>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="senha-atual">{tSenha.currentPasswordLabel}</Label>
                  <Input
                    id="senha-atual"
                    type={showSenhaFields ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nova-senha">{tSenha.newPasswordLabel}</Label>
                  <Input
                    id="nova-senha"
                    type={showSenhaFields ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmar-nova-senha">{tSenha.confirmPasswordLabel}</Label>
                  <Input
                    id="confirmar-nova-senha"
                    type={showSenhaFields ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmarNovaSenha}
                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    required
                  />
                </div>

                {senhaError && <p className="text-[12.5px] text-error font-medium">{senhaError}</p>}

                <div className="flex justify-end mt-1">
                  <Button variant="primary" type="submit" disabled={changingPassword}>
                    {changingPassword ? tSenha.submitting : tSenha.submit}
                  </Button>
                </div>
              </form>
            </div>

            <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-c-text">{tMfa.sectionTitle}</p>
                <Badge variant={totpFactor ? 'success' : 'default'}>
                  {totpFactor ? tMfa.enabledBadge : tMfa.disabledBadge}
                </Badge>
              </div>
              <p className="text-[12px] text-c-text-2">{tMfa.sectionDescription}</p>
              {totpFactor ? (
                <Button
                  variant="link"
                  disabled={disablingMfa}
                  onClick={() => setShowDisableMfaConfirm(true)}
                  className="self-start"
                >
                  {disablingMfa ? tMfa.disabling : tMfa.disableButton}
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setShowMfaEnroll(true)} className="self-start">
                  {tMfa.enableButton}
                </Button>
              )}
            </div>

            <div className="rounded-[20px] bg-c-card shadow-[var(--shadow-1)] border border-c-line p-6 flex flex-col gap-4">
              <p className="text-[13px] font-medium text-c-text">{t.lgpdSectionTitle}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" disabled={exporting} onClick={handleExportar}>
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {t.exportButton}
                </Button>
                {!exclusaoPendenteEm && (
                  <Button variant="link" disabled={deleting} onClick={() => setShowDeleteConfirm(true)}>
                    {t.deleteButton}
                  </Button>
                )}
              </div>
              {exclusaoPendenteEm && (
                <p className="text-[12px] text-c-text-2">
                  {t.deletePendingNotice(new Date(exclusaoPendenteEm).toLocaleDateString())}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showMfaEnroll && (
        <MfaEnrollModal onClose={() => setShowMfaEnroll(false)} onEnrolled={handleMfaEnrolled} />
      )}

      {showDisableMfaConfirm && (
        <ConfirmDialog
          title={tMfa.disableConfirmTitle}
          message={tMfa.disableConfirm}
          confirmLabel={tMfa.disableConfirmAction}
          cancelLabel={tMfa.cancelButton}
          onConfirm={handleDisableMfa}
          onClose={() => setShowDisableMfaConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t.deleteConfirmTitle}
          message={t.deleteConfirm}
          confirmLabel={t.deleteConfirmAction}
          cancelLabel={t.deleteCancelAction}
          onConfirm={handleSolicitarExclusao}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Toast */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#14151a',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 10,
          maxWidth: 360,
          opacity: toast ? 1 : 0,
          transform: toast ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          pointerEvents: 'none',
        }}
      >
        <Check size={13} className="shrink-0" />
        {toast}
      </div>
    </div>
  )
}
