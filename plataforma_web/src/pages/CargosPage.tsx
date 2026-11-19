import { PageHeader } from '../components/molecules/PageHeader'
import { CargosManager } from '../components/organisms/CargosManager'

export function CargosPage() {
  return (
    <>
      <PageHeader titulo="Cargos" descripcion="Catálogo de cargos institucionales." />
      <CargosManager />
    </>
  )
}
