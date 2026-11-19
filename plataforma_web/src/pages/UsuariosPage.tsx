import { PageHeader } from '../components/molecules/PageHeader'
import { UsuariosManager } from '../components/organisms/UsuariosManager'

export function UsuariosPage() {
  return (
    <>
      <PageHeader titulo="Usuarios" descripcion="Gestión de cuentas, roles y áreas asignadas." />
      <UsuariosManager />
    </>
  )
}
