import { AuthLayout } from '../components/templates/AuthLayout'
import { ResetPasswordForm } from '../components/organisms/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout
      etiqueta="NUEVA CONTRASEÑA"
      titulo="Restablecer contraseña"
      descripcion="Ingrese su correo y defina una nueva contraseña para recuperar el acceso."
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}
