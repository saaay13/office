import { Layers } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'

export function TiposRegistroPage() {
  return (
    <>
      <PageHeader
        titulo="Tipos de registro"
        descripcion="Define las estructuras de registro disponibles para el área."
        etiqueta="CONFIGURACIÓN DEL ÁREA"
        icono={Layers}
        acciones={<Badge tono="info">Sección disponible</Badge>}
      />

      <SectionCard
        titulo="Tipos configurados"
        descripcion="Los formularios de creación se incorporarán en una fase posterior."
        icono={Layers}
      >
        <EmptyState
          titulo="Aún no hay tipos de registro"
          descripcion="Cuando se habilite la administración podrás crear el primer tipo de registro."
        />
      </SectionCard>
    </>
  )
}
