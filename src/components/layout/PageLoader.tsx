import { usePlataformaConfig } from '@/context/PlataformaConfigContext'

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center" role="status" aria-label="Carregando">
      <div
        className="h-8 w-8 rounded-full border-2 border-c-line border-t-accent animate-spin"
        aria-hidden="true"
      />
    </div>
  )
}

export function SplashScreen() {
  const { config } = usePlataformaConfig()
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-c-bg"
      role="status"
      aria-label="Carregando"
    >
      <img src={config.logoIconeUrl} alt="Be Planned" className="h-10 w-auto object-contain animate-pulse" />
      <div
        className="h-6 w-6 rounded-full border-2 border-c-line border-t-accent animate-spin"
        aria-hidden="true"
      />
    </div>
  )
}
