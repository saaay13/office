import { CalendarDays } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'
import { useAuth } from '../context/AuthContext'

export function ReunionesPage() {
  const { usuario } = useAuth()
  const soloLectura = usuario?.rol?.clave === 'admin_vista'

  return (
    <>
      <PageHeader
        titulo="Reuniones"
        descripcion="Consulta la agenda y el seguimiento de las reuniones del área."
        etiqueta="AGENDA INSTITUCIONAL"
        icono={CalendarDays}
        acciones={
          <Badge tono={soloLectura ? 'advertencia' : 'info'}>
            {soloLectura ? 'Solo lectura' : 'Sección disponible'}
          </Badge>
        }
      />

      <SectionCard
        titulo="Próximas reuniones"
        descripcion="Espacio preparado para la agenda de reuniones."
        icono={CalendarDays}
      >
        <EmptyState
          titulo="Aún no hay reuniones registradas"
          descripcion="Las reuniones programadas aparecerán aquí cuando se habilite el módulo."
        />
      </SectionCard>
    </>
  )
}
