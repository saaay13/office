import { Link } from 'react-router-dom'
import { ChevronRight, Settings2 } from 'lucide-react'
import { Badge } from '../components/atoms/Badge'
import { Interruptor } from '../components/atoms/Interruptor'
import { EmptyState } from '../components/molecules/EmptyState'
import { PageHeader } from '../components/molecules/PageHeader'
import { SectionCard } from '../components/molecules/SectionCard'
import { OPCIONES_CONFIGURACION, PERMISOS_CONFIGURACION, enlaceVisible } from '../config/navegacion'
import { useAuth } from '../context/AuthContext'
import { useConfiguracion } from '../context/ConfiguracionContext'

export function AdministrarMiAreaPage() {
  const { usuario, tienePermiso } = useAuth()
  const { modoActivo, autorizado, alternar } = useConfiguracion()
  const rol = usuario?.rol?.clave ?? ''
  const esPersonal = rol === 'personal'
  const area = usuario?.area?.nombre ?? 'sin área asignada'
  const contexto = { rol: usuario?.rol?.clave ?? null, tienePermiso }

  const autorizadas = PERMISOS_CONFIGURACION.filter(
    (permiso) => (!esPersonal || permiso.creacion) && tienePermiso(permiso.clave),
  )

  const opciones = OPCIONES_CONFIGURACION.filter((opcion) => enlaceVisible(opcion, contexto))

  return (
    <>
      <PageHeader
        titulo="Administrar mi área"
        descripcion={`Acciones de configuración disponibles para ${area}.`}
        etiqueta="CONFIGURACIÓN DEL ÁREA"
        icono={Settings2}
        acciones={<Badge tono="primario">{autorizadas.length} autorizadas</Badge>}
      />

      <SectionCard
        titulo="Modo de configuración"
        descripcion="Activa las opciones de configuración de tu área. No cambia tus permisos."
        icono={Settings2}
        accion={
          autorizado ? (
            <Interruptor
              activo={modoActivo}
              onCambiar={alternar}
              etiqueta="Activar modo de configuración"
            />
          ) : (
            <Badge tono="neutro">Sin autorización</Badge>
          )
        }
      >
        <p className="text-[11px] leading-relaxed text-muted">
          {modoActivo
            ? 'El modo está activo. Las opciones de configuración se muestran en el menú lateral.'
            : 'El modo está desactivado. Las opciones de configuración permanecen ocultas.'}
        </p>
      </SectionCard>

      <SectionCard
        titulo="Acciones autorizadas"
        descripcion="Se muestran únicamente las acciones permitidas para tu rol."
        icono={Settings2}
      >
        {autorizadas.length === 0 ? (
          <EmptyState
            titulo="Sin acciones autorizadas"
            descripcion="No tienes acciones de configuración habilitadas para tu área."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {autorizadas.map((permiso) => (
              <Badge key={permiso.clave} tono="primario">
                {permiso.nombre}
              </Badge>
            ))}
          </div>
        )}
      </SectionCard>

      {modoActivo && (
        <SectionCard
          titulo="Opciones de configuración"
          descripcion="Disponibles mientras el modo de configuración esté activo."
          icono={Settings2}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {opciones.map((opcion) => (
              <Link
                key={opcion.ruta}
                to={opcion.ruta}
                className="group flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition hover:border-brand-200 hover:bg-brand-50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-app text-brand-700 transition group-hover:bg-white">
                  <opcion.icono size={15} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-ink">{opcion.texto}</span>
                  <span className="block truncate text-[9px] text-muted">
                    {opcion.descripcion}
                  </span>
                </span>

                <ChevronRight
                  size={13}
                  className="shrink-0 text-muted-soft transition group-hover:text-brand-700"
                />
              </Link>
            ))}
          </div>
        </SectionCard>
      )}
    </>
  )
}
