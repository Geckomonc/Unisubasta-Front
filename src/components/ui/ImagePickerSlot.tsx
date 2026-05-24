import { useRef, useState, useEffect } from 'react'

interface ImagePickerSlotProps {
  /** Archivo actualmente seleccionado, o null si está vacío */
  file: File | null
  onChange: (file: File | null) => void
  /** Imagen ya existente en el servidor (URL). Usado en edición. */
  existingUrl?: string | null
  label?: string
}

/**
 * Slot cuadrado para seleccionar una imagen. Equivalente a los botones
 * `_botonImagen(index)` de `registro_producto_screen.dart`.
 */
export function ImagePickerSlot({
  file,
  onChange,
  existingUrl,
  label = 'Agregar imagen',
}: ImagePickerSlotProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleClick = () => inputRef.current?.click()
  const handleFiles = (f: FileList | null) => {
    if (!f || f.length === 0) return
    const picked = f[0]
    if (!picked.type.startsWith('image/')) return
    onChange(picked)
  }

  const visible = preview ?? existingUrl ?? null

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-surface-2 border-line hover:border-udea-verde-claro focus:ring-udea-verde-oscuro relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors focus:ring-2 focus:outline-none sm:h-28 sm:w-28"
      aria-label={label}
    >
      {visible ? (
        <img src={visible} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-udea-verde-oscuro dark:text-udea-verde-claro h-8 w-8"
          aria-hidden
        >
          <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5L19 17H5z" />
        </svg>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onChange(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onChange(null)
            }
          }}
          className="bg-surface text-ink absolute top-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs shadow-sm hover:opacity-90"
          aria-label="Quitar imagen"
        >
          ×
        </span>
      )}
    </button>
  )
}
