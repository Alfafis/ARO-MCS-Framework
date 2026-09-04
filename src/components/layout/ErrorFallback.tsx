export default function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
      <p className="text-[15px] font-medium text-c-text">Ocorreu um erro inesperado.</p>
      <p className="text-[13px] text-c-text-2">
        Tente recarregar a página. Se o problema persistir, entre em contato com o suporte.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="h-9 px-4 rounded-[10px] bg-accent text-white text-[13px] font-medium border-none cursor-pointer"
      >
        Recarregar
      </button>
    </div>
  )
}
