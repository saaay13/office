import { AuthLayout } from '../components/templates/AuthLayout'
import { ForgotPasswordForm } from '../components/organisms/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      titulo="Recuperar contraseña"
      descripcion="Enviaremos un enlace de restablecimiento a su correo institucional."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
