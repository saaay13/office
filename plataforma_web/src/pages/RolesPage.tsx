import { PageHeader } from '../components/molecules/PageHeader'
import { RolesManager } from '../components/organisms/RolesManager'

export function RolesPage() {
  return (
    <>
      <PageHeader titulo="Roles" descripcion="Roles del sistema y acciones habilitadas para cada uno." />
      <RolesManager />
    </>
  )
}
