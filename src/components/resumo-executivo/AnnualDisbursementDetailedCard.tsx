import { CalendarClock } from 'lucide-react'
import { useT } from '@/i18n/useLang'
import { resumoT } from '@/i18n/resumo-executivo'
import { formatMoedaCompact } from '@/lib/financeiro'
import type { DesembolsoItemGroup } from '@/lib/desembolsoAno'

// Visão "Detalhado" da curva de desembolso — item × ano agrupado por
// categoria. Os valores já vêm com o modo (base / provisão / IPCA) aplicado
// por célula, então essa view é 100% consistente com o modo Agregado:
// somando as células do detalhado por ano bate exatamente com a linha
// "Total geral" do agregado.

interface Props {
  years: { label: string }[]
  groups: DesembolsoItemGroup[]
  totaisPorAno: number[]
}

// grid: 1ª coluna com nome da atividade (largura fixa) + N colunas de ano.
const COL_TEMPLATE = '260px repeat(var(--yrs), minmax(0, 1fr))'
const CELL_NUM = 'py-[5px] flex items-center justify-center font-mono text-[0.72rem] text-c-text'
const CELL_LABEL = 'py-[5px] pr-3 flex items-center text-[12px] text-c-text-2 leading-tight'

export default function AnnualDisbursementDetailedCard({ years, groups, totaisPorAno }: Props) {
  const t = useT(resumoT)

  const gridStyle = {
    gridTemplateColumns: COL_TEMPLATE,
    ['--yrs' as unknown as string]: years.length.toString(),
  } as React.CSSProperties

  return (
    <div className="card">
      <div className="flex items-center gap-1.5 mb-4">
        <CalendarClock size={14} color="var(--accent)" aria-hidden="true" />
        <span className="font-semibold text-[0.875rem] text-c-text">{t.disbursementDetailedTitle}</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[820px]" style={gridStyle}>
          {/* Header */}
          <div className="pb-2.5 pr-3 flex items-center">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2">
              {t.detailedActivityHeader}
            </span>
          </div>
          {years.map((y) => (
            <div key={y.label} className="pb-2.5 flex items-center justify-center">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-c-text-2">{y.label}</span>
            </div>
          ))}

          {/* Groups */}
          {groups.flatMap((group, gi) => [
            <div
              key={`gh${gi}`}
              className="py-[6px] pr-3 flex items-center border-t border-[rgba(20,21,26,.06)]"
              style={{ gridColumn: `1 / -1` }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-c-text">
                {group.categoriaNome}
              </span>
            </div>,
            ...group.items.flatMap((item, ii) => [
              <div key={`in${gi}-${ii}`} className={`${CELL_LABEL} border-t border-[rgba(20,21,26,.04)]`}>
                <span className="truncate" title={item.nome}>
                  {item.nome}
                  {item.unidade ? <span className="text-c-text-2/60"> · {item.unidade}</span> : null}
                </span>
              </div>,
              ...item.valoresPorAno.map((val, yi) => (
                <div key={`iv${gi}-${ii}-${yi}`} className={`${CELL_NUM} border-t border-[rgba(20,21,26,.04)]`}>
                  {val > 0 ? (
                    <span className="font-bold">{formatMoedaCompact(val, false)}</span>
                  ) : (
                    <span className="text-c-text-2/25">—</span>
                  )}
                </div>
              )),
            ]),
            <div key={`sn${gi}`} className={`${CELL_LABEL} border-t border-[rgba(20,21,26,.12)]`}>
              <span className="font-semibold text-c-text">{t.detailedSubtotalLabel(group.categoriaNome)}</span>
            </div>,
            ...group.subtotaisPorAno.map((val, yi) => (
              <div key={`sv${gi}-${yi}`} className={`${CELL_NUM} border-t border-[rgba(20,21,26,.12)]`}>
                {val > 0 ? (
                  <span className="font-bold text-c-text">{formatMoedaCompact(val, false)}</span>
                ) : (
                  <span className="text-c-text-2/25">—</span>
                )}
              </div>
            )),
          ])}

          {/* Divider */}
          <div style={{ gridColumn: '1 / -1' }} className="h-px bg-[rgba(20,21,26,.16)] my-1" />

          {/* Total por ano — soma direta das células (já com modo aplicado) */}
          <div className={`${CELL_LABEL} border-t-2 border-[rgba(20,21,26,.22)] pt-2`}>
            <span className="font-semibold text-c-text">{t.detailedTotalPerYearLabel}</span>
          </div>
          {totaisPorAno.map((val, yi) => (
            <div key={`t${yi}`} className={`${CELL_NUM} border-t-2 border-[rgba(20,21,26,.22)] pt-2`}>
              <span className="font-bold text-c-text">{formatMoedaCompact(val, false)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-c-text-2">{t.detailedFooterNote}</p>
    </div>
  )
}
