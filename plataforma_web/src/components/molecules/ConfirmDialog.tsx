import { Button } from '../atoms/Button'

type Props = {
  titulo: string
  mensaje: string
  confirmando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({ titulo, mensaje, confirmando = false, onConfirmar, onCancelar }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-label={titulo} className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-primary-700">{titulo}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{mensaje}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variante="contorno" onClick={onCancelar} disabled={confirmando}>
            Cancelar
          </Button>
          <Button variante="peligro" onClick={onConfirmar} cargando={confirmando}>
            Desactivar
          </Button>
        </div>
      </div>
    </div>
  )
}
