import { api } from './api'
import type { RespuestaMensaje, StatusEntidad } from '../types'

export type AccionCatalogo = 'activar' | 'desactivar' | 'eliminar' | 'restaurar'

export type RecursoCatalogo = 'areas' | 'cargos' | 'roles' | 'permisos' | 'usuarios'

export type FiltroEstado = {
  valor: string
  texto: string
}

export const FILTROS_ESTADO: FiltroEstado[] = [
  { valor: 'activo', texto: 'Activos' },
  { valor: 'desactivado', texto: 'Desactivados' },
  { valor: 'eliminado', texto: 'Papelera' },
]

const ESTADOS_VALIDOS: Record<AccionCatalogo, StatusEntidad[]> = {
  activar: ['desactivado'],
  desactivar: ['activo'],
  eliminar: ['activo', 'desactivado'],
  restaurar: ['eliminado'],
}

export function accionesDisponibles(status: StatusEntidad): AccionCatalogo[] {
  return (Object.keys(ESTADOS_VALIDOS) as AccionCatalogo[]).filter((accion) =>
    ESTADOS_VALIDOS[accion].includes(status),
  )
}

export const ETIQUETAS_ACCION: Record<AccionCatalogo, string> = {
  activar: 'Activar',
  desactivar: 'Desactivar',
  eliminar: 'Eliminar',
  restaurar: 'Restaurar',
}

const INFINITIVOS: Record<AccionCatalogo, string> = {
  activar: 'activar',
  desactivar: 'desactivar',
  eliminar: 'eliminar',
  restaurar: 'restaurar',
}

const PARTICIPIOS: Record<AccionCatalogo, string> = {
  activar: 'activado',
  desactivar: 'desactivado',
  eliminar: 'eliminado',
  restaurar: 'restaurado',
}

export function sufijoPermiso(accion: AccionCatalogo): string {
  return accion === 'eliminar' ? 'eliminar' : accion === 'restaurar' ? 'restaurar' : 'desactivar'
}

export function mensajeConfirmacion(accion: AccionCatalogo, nombre: string): string {
  return `¿Desea ${INFINITIVOS[accion]} "${nombre}"?`
}

export function mensajeExito(
  accion: AccionCatalogo,
  sustantivo: string,
  femenino = false,
): string {
  return `${sustantivo} ${PARTICIPIOS[accion]}${femenino ? 'a' : ''} correctamente.`
}

export function ejecutarAccion(
  recurso: RecursoCatalogo,
  id: number,
  accion: AccionCatalogo,
): Promise<RespuestaMensaje> {
  return api[recurso][accion](id)
}
