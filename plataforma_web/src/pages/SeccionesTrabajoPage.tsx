import { FolderOpen } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'
import { useAuth } from '../context/AuthContext'

export function SeccionesTrabajoPage() {
  const { usuario } = useAuth()
  const soloLectura = usuario?.rol?.clave === 'admin_vista'
  const area = usuario?.area?.nombre ?? 'sin área asignada'

  return (
    <>
      <PageHeader
        titulo="Secciones de trabajo"
        descripcion={`Tipos de registro habilitados para ${area}.`}
        etiqueta="ESPACIO DE TRABAJO"
        icono={FolderOpen}
        acciones={
          <Badge tono={soloLectura ? 'advertencia' : 'info'}>
            {soloLectura ? 'Solo lectura' : 'Sección disponible'}
          </Badge>
        }
      />

      <SectionCard
        titulo="Secciones habilitadas"
        descripcion="Se muestran automáticamente según la configuración del área."
        icono={FolderOpen}
      >
        <EmptyState
          titulo="Sin secciones habilitadas"
          descripcion="Las secciones aparecerán cuando el área tenga tipos de registro configurados."
        />
      </SectionCard>
    </>
  )
}
