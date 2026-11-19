import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../atoms/Alert'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { useAuth } from '../../context/AuthContext'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'

type Estado = { usuario: string; password: string }

export function LoginForm() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [datos, setDatos] = useState<Estado>({ usuario: '', password: '' })
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [mensaje, setMensaje] = useState('')
  const [entrando, setEntrando] = useState(false)

  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/'

  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setMensaje('')
    setErrores({})
    setEntrando(true)

    try {
      await iniciarSesion(datos.usuario.trim(), datos.password)
      navegar(destino, { replace: true })
    } catch (fallo) {
      setErrores(erroresDeCampo(fallo))
      setMensaje(mensajeDeError(fallo))
    } finally {
      setEntrando(false)
    }
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="space-y-4" noValidate>
      {mensaje && <Alert tono="error">{mensaje}</Alert>}

      <Input
        etiqueta="Usuario o correo institucional"
        type="text"
        autoComplete="username"
        value={datos.usuario}
        onChange={(evento) => setDatos({ ...datos, usuario: evento.target.value })}
        error={errores.usuario}
        placeholder="ej. pa"
        required
      />

      <Input
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        value={datos.password}
        onChange={(evento) => setDatos({ ...datos, password: evento.target.value })}
        error={errores.password}
        placeholder="Su contraseña"
        required
      />

      <div className="flex items-center justify-between">
        <Link to="/recuperar-clave" className="text-sm font-medium text-secondary-600 hover:text-secondary-700">
          Olvidé mi contraseña
        </Link>
      </div>

      <Button type="submit" className="w-full" cargando={entrando}>
        Ingresar al sistema
      </Button>
    </form>
  )
}
