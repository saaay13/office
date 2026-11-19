import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../atoms/Alert'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { api } from '../../services/api'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setErrores({})
    setMensaje('')
    setEnviando(true)

    try {
      const respuesta = await api.auth.forgotPassword(email.trim())
      setMensaje(respuesta.message)
    } catch (fallo) {
      setErrores(erroresDeCampo(fallo))
      setMensaje(mensajeDeError(fallo))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="space-y-4" noValidate>
      {mensaje && <Alert tono={Object.keys(errores).length > 0 ? 'error' : 'exito'}>{mensaje}</Alert>}

      <Input
        etiqueta="Correo institucional"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        error={errores.email}
        placeholder="nombre@tarija.gob.bo"
        required
      />

      <Button type="submit" className="w-full" cargando={enviando}>
        Enviar enlace de recuperación
      </Button>

      <Link to="/ingresar" className="block text-center text-sm font-medium text-secondary-600 hover:text-secondary-700">
        Volver al ingreso
      </Link>
    </form>
  )
}
