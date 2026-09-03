import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import PageHeader from '@/components/layout/PageHeader'
import { useT } from '@/i18n/useLang'
import { perfilT } from '@/i18n/perfil'
import { supabase } from '@/integrations/supabase/client'
import { formatTelefone } from '@/lib/telefone'
import type { PerfilRow } from '@/types'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

export default function Perfil() {
  const t = useT(perfilT)

  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<PerfilRow | null>(null)
  const [loading, setLoading] = useState(true)

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
      setLoading(false)
    })
  }, [])

  async function handleSalvar() {
    setSaving(true)
    try {
      const { data, error } = await supabase.rpc('atualizar_meu_perfil', {
        p_nome: nome,
        p_profissao: profissao,
        p_telefone: telefone,
      })
      if (error || !data) throw error ?? new Error('Falha ao salvar perfil')
      setPerfil(data)
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

      <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 overflow-y-auto flex-1 max-w-[560px]">
        {!loading && (
          <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-6">
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

            <div className="h-px bg-[rgba(20,21,26,.06)]" />

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
      </div>

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
