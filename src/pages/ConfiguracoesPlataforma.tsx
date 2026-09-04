import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import ImagemUploadRow from '@/components/plataforma/ImagemUploadRow'
import { useT } from '@/i18n/useLang'
import { configuracoesPlataformaT } from '@/i18n/configuracoesPlataforma'
import { supabase } from '@/integrations/supabase/client'
import {
  usePlataformaConfig,
  DEFAULT_LOGO_ICONE,
  DEFAULT_LOGO_COMPLETO,
  DEFAULT_FUNDO,
  DEFAULT_COR,
} from '@/context/PlataformaConfigContext'

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const MAX_FUNDO_BYTES = 4 * 1024 * 1024

export default function ConfiguracoesPlataforma() {
  const t = useT(configuracoesPlataformaT)
  const { atualizarConfig } = usePlataformaConfig()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [logoIconeUrl, setLogoIconeUrl] = useState<string | null>(null)
  const [logoCompletoUrl, setLogoCompletoUrl] = useState<string | null>(null)
  const [fundoUrl, setFundoUrl] = useState<string | null>(null)
  const [corPrimaria, setCorPrimaria] = useState(DEFAULT_COR)
  const [fundoAtivo, setFundoAtivo] = useState(true)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    supabase
      .from('configuracoes_plataforma')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setLogoIconeUrl(data?.logo_icone_url ?? null)
        setLogoCompletoUrl(data?.logo_completo_url ?? null)
        setFundoUrl(data?.fundo_url ?? null)
        setCorPrimaria(data?.cor_primaria ?? DEFAULT_COR)
        setFundoAtivo(data?.fundo_ativo ?? true)
        setLoading(false)
      })
  }, [])

  async function handleSalvar() {
    setSaving(true)
    try {
      await atualizarConfig({
        logoIconeUrl,
        logoCompletoUrl,
        corPrimaria,
        fundoUrl,
        fundoAtivo,
      })
      showToast(t.savedToast)
    } catch {
      showToast(t.saveErrorToast)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t.headerTitle} subtitle={t.headerSubtitle} />

      <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 overflow-y-auto flex-1 max-w-[560px]">
        {!loading && (
          <>
            <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-5">
              <p className="text-[13px] font-medium text-c-text">{t.sectionLogos}</p>
              <ImagemUploadRow
                label={t.labelLogoIcone}
                hint={t.hintLogoIcone}
                currentUrl={logoIconeUrl ?? DEFAULT_LOGO_ICONE}
                isCustom={logoIconeUrl != null}
                pasta="logo-icone"
                maxBytes={MAX_LOGO_BYTES}
                changeLabel={t.change}
                removeLabel={t.remove}
                typeErrorMsg={t.uploadTypeError}
                sizeErrorMsg={t.uploadSizeError}
                uploadErrorMsg={t.uploadErrorToast}
                onUploaded={setLogoIconeUrl}
                onRemoved={() => setLogoIconeUrl(null)}
              />
              <ImagemUploadRow
                label={t.labelLogoCompleto}
                hint={t.hintLogoCompleto}
                currentUrl={logoCompletoUrl ?? DEFAULT_LOGO_COMPLETO}
                isCustom={logoCompletoUrl != null}
                pasta="logo-completo"
                maxBytes={MAX_LOGO_BYTES}
                changeLabel={t.change}
                removeLabel={t.remove}
                typeErrorMsg={t.uploadTypeError}
                sizeErrorMsg={t.uploadSizeError}
                uploadErrorMsg={t.uploadErrorToast}
                onUploaded={setLogoCompletoUrl}
                onRemoved={() => setLogoCompletoUrl(null)}
              />
            </div>

            <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-3">
              <p className="text-[13px] font-medium text-c-text">{t.sectionCor}</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="config-cor-primaria"
                  name="corPrimaria"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="w-11 h-11 rounded-[10px] border border-[rgba(20,21,26,.08)] cursor-pointer bg-transparent p-0"
                  aria-label={t.labelCor}
                />
                <input
                  type="text"
                  id="config-cor-primaria-hex"
                  name="corPrimariaHex"
                  value={corPrimaria}
                  onChange={(e) => {
                    const v = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setCorPrimaria(v)
                  }}
                  className="rounded-[11px] border-none bg-[#f6f5f3] px-[13px] py-[9px] text-[0.875rem] font-mono text-c-text outline-none focus:shadow-[0_0_0_1.5px_var(--accent)] w-[110px]"
                  aria-label={`${t.labelCor} (hex)`}
                />
              </div>
              <p className="text-[12px] text-c-text-2">{t.hintCor}</p>
            </div>

            <div className="rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] p-6 flex flex-col gap-5">
              <p className="text-[13px] font-medium text-c-text">{t.sectionFundo}</p>
              <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  id="config-fundo-ativo"
                  name="fundoAtivo"
                  checked={fundoAtivo}
                  onChange={(e) => setFundoAtivo(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
                <span className="text-[0.875rem] text-c-text">{t.labelFundoAtivo}</span>
              </label>
              <p className="text-[12px] text-c-text-2 -mt-2">{t.hintFundoAtivo}</p>

              {fundoAtivo && (
                <ImagemUploadRow
                  label={t.labelFundoImagem}
                  hint={t.hintFundoImagem}
                  currentUrl={fundoUrl ?? DEFAULT_FUNDO}
                  isCustom={fundoUrl != null}
                  pasta="fundo"
                  maxBytes={MAX_FUNDO_BYTES}
                  changeLabel={t.change}
                  removeLabel={t.remove}
                  typeErrorMsg={t.uploadTypeError}
                  sizeErrorMsg={t.uploadSizeError}
                  uploadErrorMsg={t.uploadErrorToast}
                  onUploaded={setFundoUrl}
                  onRemoved={() => setFundoUrl(null)}
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="primary" disabled={saving} onClick={handleSalvar}>
                {saving ? t.saving : t.save}
              </Button>
            </div>
          </>
        )}
      </div>

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
