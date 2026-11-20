import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Alert,Button,Input } from '../atoms'
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
  const [verClave, setVerClave] = useState(false)

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
        placeholder="Ej. pa"
        prefijo={<UserRound size={14} />}
        required
      />

      <div>
        <Input
          etiqueta="Contraseña"
          type={verClave ? 'text' : 'password'}
          autoComplete="current-password"
          value={datos.password}
          onChange={(evento) => setDatos({ ...datos, password: evento.target.value })}
          error={errores.password}
          placeholder="Ingrese su contraseña"
          prefijo={<LockKeyhole size={14} />}
          sufijo={
            <button
              type="button"
              onClick={() => setVerClave((valor) => !valor)}
              aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="text-muted-soft transition hover:text-brand-700"
            >
              {verClave ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          required
        />

        <div className="mt-2 flex justify-end">
          <Link
            to="/recuperar-clave"
            className="text-[10px] font-semibold text-brand-700 hover:underline"
          >
            ¿Olvidó su contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        cargando={entrando}
        className="h-[42px] w-full text-xs shadow-[0_3px_6px_rgba(0,80,140,0.2)]"
      >
        Iniciar sesión
        <ArrowRight size={15} />
      </Button>

      <p className="pt-1 text-center text-[9px] leading-relaxed text-muted">
        Acceso restringido al personal autorizado de la Gobernación.
      </p>
    </form>
  )
}
