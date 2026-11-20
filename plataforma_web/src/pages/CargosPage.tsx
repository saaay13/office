import { BriefcaseBusiness } from 'lucide-react'
import { PageHeader } from '../components/molecules/PageHeader'
import { CargosManager } from '../components/organisms/CargosManager'

export function CargosPage() {
  return (
    <>
      <PageHeader
        titulo="Cargos"
        descripcion="Catálogo de cargos institucionales disponibles para asignar a los usuarios."
        etiqueta="ORGANIZACIÓN"
        icono={BriefcaseBusiness}
      />
      <CargosManager />
    </>
  )
}
