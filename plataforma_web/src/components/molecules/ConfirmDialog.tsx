import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../atoms'

type Props = {
  titulo: string
  mensaje: string
  confirmando?: boolean
  confirmarTexto?: string
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  titulo,
  mensaje,
  confirmando = false,
  confirmarTexto = 'Desactivar',
  onConfirmar,
  onCancelar,
}: Props) {
  useEffect(() => {
    function alPresionar(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        onCancelar()
      }
    }

    window.addEventListener('keydown', alPresionar)

    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCancelar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-md rounded-xl border border-line bg-white p-5 shadow-[0_24px_60px_rgba(11,42,70,0.25)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger-strong">
            <AlertTriangle size={20} />
          </span>

          <div>
            <h3 className="text-sm font-semibold text-ink">{titulo}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">{mensaje}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
          <Button variante="contorno" onClick={onCancelar} disabled={confirmando}>
            Cancelar
          </Button>
          <Button variante="peligro" onClick={onConfirmar} cargando={confirmando}>
            {confirmarTexto}
          </Button>
        </div>
      </div>
    </div>
  )
}
