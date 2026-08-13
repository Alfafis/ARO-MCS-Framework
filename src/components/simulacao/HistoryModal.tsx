import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n/LangContext'
import { simulacaoT } from '@/i18n/simulacao'
import type { HistoryRun, UncertaintyLevel } from '@/types/simulacao'

const UNC_VARIANT: Record<UncertaintyLevel, 'success' | 'warning' | 'accent'> = {
  baixo: 'success', moderado: 'warning', alto: 'accent',
}

interface Props {
  history:  HistoryRun[]
  onSelect: (run: HistoryRun) => void
  onClose:  () => void
}

export default function HistoryModal({ history, onSelect, onClose }: Props) {
  const t = useT(simulacaoT)

  const UNC_LABEL: Record<UncertaintyLevel, string> = {
    baixo: t.unc_low, moderado: t.unc_mod, alto: t.unc_high,
  }

  return (
    <Dialog title={t.historyTitle} onClose={onClose}>
      {(close) => (
        <>
          {history.map(run => (
            <div
              key={run.id}
              className="flex items-center justify-between px-2.5 py-3 rounded-[10px] cursor-pointer hover:bg-[#f6f5f3] border-b border-[rgba(20,21,26,.08)] last:border-b-0 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => close(() => onSelect(run))}
              onKeyDown={e => e.key === 'Enter' && close(() => onSelect(run))}
            >
              <div>
                <div className="text-[0.875rem] font-semibold text-c-text mb-0.5">{run.date}</div>
                <div className="text-[0.78125rem] text-c-text-2">{run.dist} · {run.iterations} {t.iterSuffix}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-[0.9375rem] text-c-text">{run.mean}</span>
                <Badge variant={UNC_VARIANT[run.uncertainty]}>{UNC_LABEL[run.uncertainty]}</Badge>
              </div>
            </div>
          ))}
        </>
      )}
    </Dialog>
  )
}
