import { Ban, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react'

type Nombre = 'editar' | 'activar' | 'desactivar' | 'eliminar' | 'restaurar'

const iconos = {
  editar: Pencil,
  activar: Check,
  desactivar: Ban,
  eliminar: Trash2,
  restaurar: RotateCcw,
}

export function IconoAccion({ nombre }: { nombre: Nombre }) {
  const Icono = iconos[nombre]

  return <Icono size={14} aria-hidden="true" />
}
