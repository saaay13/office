import { Navigate } from 'react-router-dom'
import { AuthLayout } from '../components/templates/AuthLayout'
import { LoginForm } from '../components/organisms/LoginForm'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return <div className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">Cargando...</div>
  }

  if (usuario !== null) {
    return <Navigate to="/" replace />
  }

  return (
    <AuthLayout titulo="Ingreso al sistema" descripcion="Use su usuario institucional y su contraseña para continuar.">
      <LoginForm />
    </AuthLayout>
  )
}
