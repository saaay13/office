import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { Alert,Button,Input } from '../atoms'
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
        prefijo={<Mail size={14} />}
        required
      />

      <Button type="submit" className="h-[42px] w-full text-xs" cargando={enviando}>
        Enviar enlace de recuperación
        <Send size={14} />
      </Button>

      <Link
        to="/ingresar"
        className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft size={13} />
        Volver al ingreso
      </Link>
    </form>
  )
}
