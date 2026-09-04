import { useEffect, useMemo, useState } from 'react'
import { Check, LayoutDashboard } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import ImagemUploadRow from '@/components/plataforma/ImagemUploadRow'
import { useT } from '@/i18n/useLang'
import { configuracoesPlataformaT } from '@/i18n/configuracoesPlataforma'
import { supabase } from '@/integrations/supabase/client'
import { derivarTonsAccent } from '@/lib/color'
import {
  usePlataformaConfig,
  DEFAULT_LOGO_ICONE,
  DEFAULT_LOGO_COMPLETO,
  DEFAULT_FUNDO,
  DEFAULT_COR,
} from '@/context/PlataformaConfigContext'

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const MAX_FUNDO_BYTES = 4 * 1024 * 1024

const FUNDO_SEM_PONTILHADO = '/PADRONAGEM%20-%20FUNDO%20sem%20pontilhado.png'

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

  const tons = useMemo(() => derivarTonsAccent(/^#[0-9a-fA-F]{6}$/.test(corPrimaria) ? corPrimaria : DEFAULT_COR), [
    corPrimaria,
  ])

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

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,560px)_320px] gap-6 px-4 sm:px-8 pb-8 overflow-y-auto flex-1 items-start">
        {!loading && (
          <div className="flex flex-col gap-6">
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
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-[12px] font-medium text-c-text-2">{t.fundoPresetsLabel}</p>
                    <div className="flex gap-3">
                      {[
                        { url: null, thumb: DEFAULT_FUNDO, label: t.fundoPresetPontilhado },
                        { url: FUNDO_SEM_PONTILHADO, thumb: FUNDO_SEM_PONTILHADO, label: t.fundoPresetSemPontilhado },
                      ].map((preset) => {
                        const selected = fundoUrl === preset.url
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setFundoUrl(preset.url)}
                            className="flex flex-col gap-1.5 cursor-pointer border-none bg-transparent p-0"
                          >
                            <span
                              className="block w-24 h-16 rounded-[10px] overflow-hidden border-2 bg-[#f4f3f1] bg-cover bg-center transition-colors"
                              style={{
                                backgroundImage: `url('${preset.thumb}')`,
                                borderColor: selected ? 'var(--accent)' : 'rgba(20,21,26,.1)',
                              }}
                            />
                            <span className="text-[11px] text-c-text-2">{preset.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <ImagemUploadRow
                    label={t.labelFundoImagem}
                    hint={t.hintFundoImagem}
                    currentUrl={fundoUrl && fundoUrl !== FUNDO_SEM_PONTILHADO ? fundoUrl : DEFAULT_FUNDO}
                    isCustom={fundoUrl != null && fundoUrl !== FUNDO_SEM_PONTILHADO}
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
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="primary" disabled={saving} onClick={handleSalvar}>
                {saving ? t.saving : t.save}
              </Button>
            </div>
          </div>
        )}

        {!loading && (
          <div className="xl:sticky xl:top-4 rounded-[20px] bg-white shadow-[0_1px_2px_rgba(20,21,26,.06)] border border-[rgba(20,21,26,.06)] overflow-hidden">
            <p className="text-[13px] font-medium text-c-text px-5 pt-5">{t.sectionPreview}</p>

            {/* Sidebar em miniatura */}
            <div className="mt-4 mx-5 rounded-[14px] border border-[rgba(20,21,26,.06)] overflow-hidden">
              <div className="bg-[#f9f8f6] p-3 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 px-1 pb-2">
                  <img src={logoIconeUrl ?? DEFAULT_LOGO_ICONE} alt="" className="h-5 w-5 object-contain" />
                  <span className="text-[12px] font-bold text-c-text">{t.previewBrandLabel}</span>
                </div>
                <div
                  className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[11px] font-semibold text-white"
                  style={{ backgroundColor: tons.base }}
                >
                  <LayoutDashboard size={13} />
                  {t.previewNavLabel}
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[11px] text-c-text-2">
                  <div className="w-[13px] h-[13px] rounded-[3px] bg-[rgba(20,21,26,.1)]" />
                  <div className="h-[7px] w-16 rounded-full bg-[rgba(20,21,26,.1)]" />
                </div>
              </div>
            </div>

            {/* Marca completa + botão */}
            <div className="mt-4 mx-5 p-4 rounded-[14px] border border-[rgba(20,21,26,.06)] flex flex-col items-center gap-3">
              <img src={logoCompletoUrl ?? DEFAULT_LOGO_COMPLETO} alt="" className="h-14 object-contain" />
              <button
                type="button"
                className="w-full py-2 rounded-[10px] text-white text-[12px] font-semibold border-none cursor-default"
                style={{ backgroundColor: tons.base }}
              >
                {t.previewButtonLabel}
              </button>
            </div>

            {/* Tons derivados */}
            <div className="mt-4 mx-5 flex gap-2">
              {[tons.claro, tons.base, tons.escuro].map((cor) => (
                <div key={cor} className="flex-1 h-8 rounded-[8px] border border-[rgba(20,21,26,.06)]" style={{ backgroundColor: cor }} />
              ))}
            </div>

            {/* Fundo — wash mais fraco que o real (0.55 vs 0.92 do app) só
                aqui, pra diferença entre presets/imagem custom ficar visível
                no preview; no app real o wash continua 92% (sutil de propósito). */}
            <div
              className="mt-4 mx-5 mb-5 h-20 rounded-[14px] border border-[rgba(20,21,26,.06)] bg-[#f4f3f1]"
              style={{
                backgroundImage: fundoAtivo
                  ? `linear-gradient(rgba(244, 243, 241, 0.55), rgba(244, 243, 241, 0.55)), url('${fundoUrl ?? DEFAULT_FUNDO}')`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
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
