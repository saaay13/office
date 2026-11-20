import { Settings2 } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'
import { PERMISOS_CONFIGURACION } from '../config/navegacion'
import { useAuth } from '../context/AuthContext'

export function AdministrarMiAreaPage() {
  const { usuario, tienePermiso } = useAuth()
  const rol = usuario?.rol?.clave ?? ''
  const esPersonal = rol === 'personal'
  const area = usuario?.area?.nombre ?? 'sin área asignada'

  const autorizados = PERMISOS_CONFIGURACION.filter(
    (permiso) => (!esPersonal || permiso.creacion) && tienePermiso(permiso.clave),
  )

  return (
    <>
      <PageHeader
        titulo="Administrar mi área"
        descripcion={`Acciones de configuración disponibles para ${area}.`}
        etiqueta="CONFIGURACIÓN DEL ÁREA"
        icono={Settings2}
        acciones={<Badge tono="primario">{autorizados.length} autorizadas</Badge>}
      />

      <SectionCard
        titulo="Acciones autorizadas"
        descripcion="Se muestran únicamente las acciones permitidas para tu rol."
        icono={Settings2}
      >
        {autorizados.length === 0 ? (
          <EmptyState
            titulo="Sin acciones autorizadas"
            descripcion="No tienes acciones de configuración habilitadas para tu área."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {autorizados.map((permiso) => (
              <Badge key={permiso.clave} tono="primario">
                {permiso.nombre}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  )
}
