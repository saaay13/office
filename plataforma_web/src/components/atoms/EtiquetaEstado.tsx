import { Badge } from './Badge'
import type { Tono } from './Badge'
import type { StatusEntidad } from '../../types'

type Configuracion = {
  texto: string
  textoFemenino: string
  tono: Tono
}

const configuracion: Record<StatusEntidad, Configuracion> = {
  activo: { texto: 'Activo', textoFemenino: 'Activa', tono: 'exito' },
  desactivado: { texto: 'Desactivado', textoFemenino: 'Desactivada', tono: 'advertencia' },
  eliminado: { texto: 'Eliminado', textoFemenino: 'Eliminada', tono: 'error' },
}

type Props = {
  status: StatusEntidad
  femenino?: boolean
}

export function EtiquetaEstado({ status, femenino = false }: Props) {
  const actual = configuracion[status]

  return <Badge tono={actual.tono}>{femenino ? actual.textoFemenino : actual.texto}</Badge>
}
