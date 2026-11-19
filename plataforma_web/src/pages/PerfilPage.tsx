import { PageHeader } from '../components/molecules/PageHeader'
import { PerfilForm } from '../components/organisms/PerfilForm'

export function PerfilPage() {
  return (
    <>
      <PageHeader titulo="Mi perfil" descripcion="Datos personales y seguridad de la cuenta." />
      <PerfilForm />
    </>
  )
}
