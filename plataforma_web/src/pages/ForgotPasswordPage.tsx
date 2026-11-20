import { AuthLayout } from '../components/templates/AuthLayout'
import { ForgotPasswordForm } from '../components/organisms/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      etiqueta="RECUPERACIÓN DE ACCESO"
      titulo="Recuperar contraseña"
      descripcion="Enviaremos un enlace de restablecimiento al correo institucional registrado."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
