import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

interface Props {
  label: string
  hint: string
  currentUrl: string
  isCustom: boolean
  pasta: string
  maxBytes: number
  changeLabel: string
  removeLabel: string
  typeErrorMsg: string
  sizeErrorMsg: string
  uploadErrorMsg: string
  onUploaded: (url: string) => void
  onRemoved: () => void
}

export default function ImagemUploadRow({
  label,
  hint,
  currentUrl,
  isCustom,
  pasta,
  maxBytes,
  changeLabel,
  removeLabel,
  typeErrorMsg,
  sizeErrorMsg,
  uploadErrorMsg,
  onUploaded,
  onRemoved,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function limparArquivosAntigos() {
    const { data: existentes } = await supabase.storage.from('plataforma').list(pasta)
    if (existentes && existentes.length > 0) {
      await supabase.storage.from('plataforma').remove(existentes.map((f) => `${pasta}/${f.name}`))
    }
  }

  async function handleSelecionar(file: File) {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError(typeErrorMsg)
      return
    }
    if (file.size > maxBytes) {
      setError(sizeErrorMsg)
      return
    }
    setUploading(true)
    try {
      await limparArquivosAntigos()
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png'
      const path = `${pasta}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('plataforma').upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type,
      })
      if (uploadError) throw uploadError
      const {
        data: { publicUrl },
      } = supabase.storage.from('plataforma').getPublicUrl(path)
      onUploaded(publicUrl)
    } catch {
      setError(uploadErrorMsg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-[12px] bg-c-surface-2 flex items-center justify-center overflow-hidden shrink-0 border border-c-line">
        <img src={currentUrl} alt="" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-c-text">{label}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : null}
            {changeLabel}
          </Button>
          {isCustom && (
            <Button variant="link" disabled={uploading} onClick={onRemoved}>
              {removeLabel}
            </Button>
          )}
        </div>
        <p className="text-[12px] text-c-text-2">{error ?? hint}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleSelecionar(file)
          }}
        />
      </div>
    </div>
  )
}
