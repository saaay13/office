import { AuthLayout } from '../components/templates/AuthLayout'
import { ResetPasswordForm } from '../components/organisms/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout
      titulo="Restablecer contraseña"
      descripcion="Ingrese su correo y la nueva contraseña para recuperar el acceso."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
