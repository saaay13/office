import { Database } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'

export function CatalogosPage() {
  return (
    <>
      <PageHeader
        titulo="Catálogos"
        descripcion="Gestiona las listas de valores utilizadas por los campos del área."
        etiqueta="CONFIGURACIÓN DEL ÁREA"
        icono={Database}
        acciones={<Badge tono="info">Sección disponible</Badge>}
      />

      <SectionCard
        titulo="Catálogos configurados"
        descripcion="Los formularios de creación se incorporarán en una fase posterior."
        icono={Database}
      >
        <EmptyState
          titulo="Aún no hay catálogos"
          descripcion="Cuando se habilite la administración podrás crear el primer catálogo."
        />
      </SectionCard>
    </>
  )
}
