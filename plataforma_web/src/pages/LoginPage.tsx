import { AuthLayout } from '../components/templates/AuthLayout'
import { LoginForm } from '../components/organisms/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout
      etiqueta="ACCESO AL SISTEMA"
      titulo="Iniciar sesión"
      descripcion="Ingrese con sus credenciales institucionales para acceder al panel de control."
    >
      <LoginForm />
    </AuthLayout>
  )
}
