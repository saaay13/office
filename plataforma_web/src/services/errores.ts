import { ApiError } from './api'

export function mensajeDeError(fallo: unknown): string {
  if (fallo instanceof ApiError) {
    const primerCampo = Object.values(fallo.errores)[0]

    if (primerCampo && primerCampo.length > 0) {
      return primerCampo[0]
    }

    return fallo.message
  }

  if (fallo instanceof Error) {
    return fallo.message
  }

  return 'Ocurrió un error inesperado.'
}

export function erroresDeCampo(fallo: unknown): Record<string, string> {
  if (!(fallo instanceof ApiError)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(fallo.errores).map(([campo, mensajes]) => [campo, mensajes[0] ?? '']),
  )
}
