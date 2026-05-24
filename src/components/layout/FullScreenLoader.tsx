export function FullScreenLoader() {
  return (
    <div className="bg-canvas flex min-h-dvh items-center justify-center">
      <div
        className="border-udea-verde-claro h-12 w-12 animate-spin rounded-full border-4 border-r-transparent"
        role="status"
        aria-label="Cargando"
      />
    </div>
  )
}
