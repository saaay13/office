import { Pencil, Trash2 } from 'lucide-react'

type Nombre = 'editar' | 'desactivar'

export function IconoAccion({ nombre }: { nombre: Nombre }) {
  const Icono = nombre === 'editar' ? Pencil : Trash2

  return <Icono size={14} aria-hidden="true" />
}
