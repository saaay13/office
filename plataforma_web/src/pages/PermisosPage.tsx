import { PageHeader } from '../components/molecules/PageHeader'
import { PermisosManager } from '../components/organisms/PermisosManager'

export function PermisosPage() {
  return (
    <>
      <PageHeader titulo="Permisos" descripcion="Catálogo de acciones disponibles en la plataforma." />
      <PermisosManager />
    </>
  )
}
