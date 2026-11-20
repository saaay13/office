import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  FolderOpen,
  KeyRound,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { Alert } from '../components/atoms/Alert'
import { Badge } from '../components/atoms/Badge'
import { Spinner } from '../components/atoms/Button'
import { GRUPOS_NAVEGACION, enlaceVisible } from '../config/navegacion'
import { EmptyState } from '../components/molecules/EmptyState'
import { SectionCard } from '../components/molecules/SectionCard'
import { StatCard } from '../components/molecules/StatCard'
import type { TonoIndicador } from '../components/molecules/StatCard'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import type { Area, Cargo, Permiso, Rol, Usuario } from '../types'

type Tarjeta = {
  titulo: string
  valor: string
  detalle: string
  subtitulo: string
  icono: LucideIcon
  tono: TonoIndicador
}

type Barra = {
  etiqueta: string
  total: number
  activos: number
}

function saludo(): string {
  const hora = new Date().getHours()

  if (hora < 12) {
    return 'Buenos días'
  }

  if (hora < 19) {
    return 'Buenas tardes'
  }

  return 'Buenas noches'
}

function inicialesDe(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('')
    .toUpperCase()
}

function tiempoRelativo(iso: string): string {
  const diferencia = Date.now() - new Date(iso).getTime()
  const minutos = Math.floor(diferencia / 60000)

  if (minutos < 1) {
    return 'Ahora'
  }

  if (minutos < 60) {
    return `Hace ${minutos} min`
  }

  const horas = Math.floor(minutos / 60)

  if (horas < 24) {
    return `Hace ${horas} h`
  }

  const dias = Math.floor(horas / 24)

  if (dias < 30) {
    return `Hace ${dias} d`
  }

  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function HomePage() {
  const { usuario, tienePermiso, cargando: cargandoSesion } = useAuth()
  const [areas, setAreas] = useState<Area[] | null>(null)
  const [cargos, setCargos] = useState<Cargo[] | null>(null)
  const [roles, setRoles] = useState<Rol[] | null>(null)
  const [permisos, setPermisos] = useState<Permiso[] | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar(): Promise<void> {
      setCargando(true)
      setError('')

      const resultados = await Promise.allSettled([
        tienePermiso('areas.ver') ? api.areas.listar() : Promise.resolve(null),
        tienePermiso('cargos.ver') ? api.cargos.listar() : Promise.resolve(null),
        tienePermiso('roles.ver') ? api.roles.listar() : Promise.resolve(null),
        tienePermiso('permisos.ver') ? api.permisos.listar() : Promise.resolve(null),
        tienePermiso('usuarios.ver') ? api.usuarios.listar() : Promise.resolve(null),
      ])

      if (!activo) {
        return
      }

      const [respuestaAreas, respuestaCargos, respuestaRoles, respuestaPermisos, respuestaUsuarios] =
        resultados

      if (respuestaAreas.status === 'fulfilled') {
        setAreas(respuestaAreas.value)
      }

      if (respuestaCargos.status === 'fulfilled') {
        setCargos(respuestaCargos.value)
      }

      if (respuestaRoles.status === 'fulfilled') {
        setRoles(respuestaRoles.value)
      }

      if (respuestaPermisos.status === 'fulfilled') {
        setPermisos(respuestaPermisos.value)
      }

      if (respuestaUsuarios.status === 'fulfilled') {
        setUsuarios(respuestaUsuarios.value)
      }

      if (resultados.some((resultado) => resultado.status === 'rejected')) {
        setError('Algunos indicadores no se pudieron cargar. Verifique su conexión o permisos.')
      }

      setCargando(false)
    }

    if (!cargandoSesion) {
      void cargar()
    }

    return () => {
      activo = false
    }
  }, [cargandoSesion, tienePermiso])

  const areasActivas = areas?.filter((area) => area.activo) ?? []
  const cargosActivos = cargos?.filter((cargo) => cargo.activo) ?? []
  const rolesActivos = roles?.filter((rol) => rol.activo) ?? []
  const permisosActivos = permisos?.filter((permiso) => permiso.activo) ?? []
  const usuariosActivos = usuarios?.filter((usuario) => usuario.activo) ?? []

  const tarjetas: Tarjeta[] = []

  if (areas) {
    tarjetas.push({
      titulo: 'ÁREAS ACTIVAS',
      valor: String(areasActivas.length),
      detalle: `${areas.length} visibles`,
      subtitulo: `${areasActivas.filter((area) => area.responsable).length} con responsable`,
      icono: FolderOpen,
      tono: 'azul',
    })
  }

  if (usuarios) {
    tarjetas.push({
      titulo: 'USUARIOS ACTIVOS',
      valor: String(usuariosActivos.length),
      detalle: `${usuarios.length - usuariosActivos.length} inactivos`,
      subtitulo: `${usuarios.length} registrados`,
      icono: Users,
      tono: 'verde',
    })
  }

  if (roles) {
    tarjetas.push({
      titulo: 'ROLES DEL SISTEMA',
      valor: String(rolesActivos.length),
      detalle: `${rolesActivos.filter((rol) => (rol.permisos?.length ?? 0) > 0).length} con permisos`,
      subtitulo: `${rolesActivos.filter((rol) => rol.es_sistema).length} de sistema`,
      icono: ShieldCheck,
      tono: 'naranja',
    })
  }

  if (permisos) {
    tarjetas.push({
      titulo: 'PERMISOS ACTIVOS',
      valor: String(permisosActivos.length),
      detalle: `${new Set(permisosActivos.map((permiso) => permiso.modulo)).size} módulos`,
      subtitulo: `${permisos.length} catalogados`,
      icono: KeyRound,
      tono: 'rojo',
    })
  }

  if (cargos) {
    tarjetas.push({
      titulo: 'CARGOS INSTITUCIONALES',
      valor: String(cargosActivos.length),
      detalle: `${cargos.length} registrados`,
      subtitulo: 'Catálogo de cargos',
      icono: BriefcaseBusiness,
      tono: 'azul',
    })
  }

  const barras = useMemo<Barra[]>(() => {
    if (usuarios) {
      const porArea = new Map<string, { total: number; activos: number }>()

      usuarios.forEach((registro) => {
        const clave = registro.area?.nombre ?? 'Sin área'
        const actual = porArea.get(clave) ?? { total: 0, activos: 0 }

        actual.total += 1

        if (registro.activo) {
          actual.activos += 1
        }

        porArea.set(clave, actual)
      })

      return Array.from(porArea.entries())
        .map(([etiqueta, valores]) => ({ etiqueta, ...valores }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
    }

    if (areas) {
      const porTipo = new Map<string, number>()

      areas.forEach((area) => {
        const clave = area.tipo
          ? area.tipo.charAt(0).toUpperCase() + area.tipo.slice(1)
          : 'Sin tipo'
        porTipo.set(clave, (porTipo.get(clave) ?? 0) + 1)
      })

      return Array.from(porTipo.entries())
        .map(([etiqueta, total]) => ({ etiqueta, total, activos: total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
    }

    return []
  }, [areas, usuarios])

  const maximo = Math.max(1, ...barras.map((barra) => barra.total))
  const mostrarActivos = usuarios !== null

  const progresos = [
    areas
      ? {
          etiqueta: 'Áreas con responsable asignado',
          valor: areasActivas.filter((area) => area.responsable).length,
          total: Math.max(1, areasActivas.length),
        }
      : null,
    roles
      ? {
          etiqueta: 'Roles con permisos configurados',
          valor: rolesActivos.filter((rol) => (rol.permisos?.length ?? 0) > 0).length,
          total: Math.max(1, rolesActivos.length),
        }
      : null,
    usuarios
      ? {
          etiqueta: 'Usuarios con acceso habilitado',
          valor: usuariosActivos.length,
          total: Math.max(1, usuarios.length),
        }
      : null,
  ].filter((progreso): progreso is { etiqueta: string; valor: number; total: number } =>
    progreso !== null,
  )

  const ultimosAccesos = useMemo(() => {
    if (!usuarios) {
      return []
    }

    return usuarios
      .filter((registro) => registro.ultimo_acceso_at !== null)
      .sort(
        (a, b) =>
          new Date(b.ultimo_acceso_at ?? 0).getTime() -
          new Date(a.ultimo_acceso_at ?? 0).getTime(),
      )
      .slice(0, 4)
  }, [usuarios])

  const rolClave = usuario?.rol?.clave ?? ''

  const accesosVisibles = GRUPOS_NAVEGACION.flatMap((grupo) => grupo.enlaces).filter(
    (enlace) =>
      enlace.ruta !== '/' &&
      enlaceVisible(enlace, { rol: rolClave === '' ? null : rolClave, tienePermiso }),
  )

  const areaPrincipal = usuario?.area?.nombre ?? 'Sin área asignada'
  const rolPrincipal = usuario?.rol?.nombre ?? 'Sin rol asignado'
  const nombre = usuario?.nombres ?? 'Usuario'
  const esGestor = rolClave === 'admin_general' || rolClave === 'encargado_area'
  const esSoloLectura = rolClave === 'admin_vista'
  const accionPrincipal = esGestor
    ? { ruta: '/administrar-mi-area', texto: 'Administrar mi área', icono: Settings2 }
    : { ruta: '/secciones-de-trabajo', texto: 'Secciones de trabajo', icono: FolderOpen }

  const areaLider = barras[0]

  const resumen =
    usuarios !== null && areaLider
      ? `${usuariosActivos.length} de ${usuarios.length} usuarios tienen acceso habilitado. El área con más personal es ${areaLider.etiqueta}.`
      : areas !== null
        ? `La estructura cuenta con ${areasActivas.length} áreas visibles, de las cuales ${areasActivas.filter((area) => area.responsable).length} tienen responsable asignado.`
        : 'Consulte Mi perfil para revisar sus datos institucionales y seguridad de la cuenta.'

  const mensajeRol = esSoloLectura
    ? 'Acceso de consulta a las áreas asignadas. Las acciones de creación, edición y eliminación no están disponibles.'
    : esGestor
      ? resumen
      : 'Registra y consulta las actividades de tu área desde las secciones de trabajo y la agenda de reuniones.'

  const fecha = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const fechaVisible = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  return (
    <>
      <section className="flex flex-col justify-between gap-5 rounded-xl bg-gradient-to-r from-[#eef3ff] via-[#eff5ff] to-[#dceaff] p-5 sm:flex-row sm:items-center">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white shadow-md shadow-brand-700/20">
            <ShieldCheck size={23} />
          </div>

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-[8px]">
              <span className="font-bold tracking-[0.16em] text-brand-700">PANEL DE CONTROL</span>
              <span className="text-muted-soft">•</span>
              <span className="text-muted">Vigencia {new Date().getFullYear()}</span>
              <Badge tono={esSoloLectura ? 'advertencia' : 'primario'}>
                {esSoloLectura ? 'Solo lectura' : rolPrincipal}
              </Badge>
            </div>

            <h1 className="text-xl leading-tight font-semibold tracking-tight text-brand-950 sm:text-2xl">
              {saludo()}, {nombre}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-muted">
              <span className="flex items-center gap-1">
                <Building2 size={12} className="text-brand-600" />
                {areaPrincipal}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-brand-600" />
                {rolPrincipal}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={12} className="text-brand-600" />
                {fechaVisible}
              </span>
            </div>

            <p className="mt-2 max-w-xl text-[10px] leading-relaxed text-brand-800">
              {mensajeRol}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Link
            to={accionPrincipal.ruta}
            className="flex h-8 items-center gap-1 rounded-md bg-brand-700 px-3 text-[10px] font-semibold text-white transition hover:bg-brand-800"
          >
            <accionPrincipal.icono size={12} />
            {accionPrincipal.texto}
          </Link>

          <Link
            to="/perfil"
            className="flex h-8 items-center gap-1 rounded-md border border-brand-200 bg-white px-3 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <UserRound size={12} />
            Mi perfil
          </Link>
        </div>
      </section>

      {cargando ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white py-14 text-[11px] text-muted">
          <Spinner pequeno />
          Cargando indicadores...
        </div>
      ) : (
        <>
          {error && <Alert tono="error">{error}</Alert>}

          {esGestor && tarjetas.length > 0 && (
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {tarjetas.slice(0, 4).map((tarjeta) => (
                <StatCard key={tarjeta.titulo} {...tarjeta} />
              ))}
            </section>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_0.85fr]">
            <div className="min-w-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <SectionCard
                  titulo="Actividades pendientes"
                  descripcion="Espacio para las tareas asignadas a tu área"
                  icono={Activity}
                >
                  <EmptyState
                    titulo="Sin actividades pendientes"
                    descripcion="Las tareas asignadas aparecerán aquí cuando se habilite el módulo de registros."
                    accion={
                      tienePermiso('registros.ver') ? (
                        <Link
                          to="/secciones-de-trabajo"
                          className="inline-flex h-7 items-center rounded-md bg-brand-50 px-2.5 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-100"
                        >
                          Ver secciones de trabajo
                        </Link>
                      ) : undefined
                    }
                  />
                </SectionCard>

                <SectionCard
                  titulo="Próximas reuniones"
                  descripcion="Espacio para la agenda de reuniones del área"
                  icono={CalendarDays}
                >
                  <EmptyState
                    titulo="Aún no hay reuniones próximas"
                    descripcion="Las reuniones programadas aparecerán aquí cuando se habilite el módulo."
                    accion={
                      tienePermiso('reuniones.ver') ? (
                        <Link
                          to="/reuniones"
                          className="inline-flex h-7 items-center rounded-md bg-brand-50 px-2.5 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-100"
                        >
                          Ver reuniones
                        </Link>
                      ) : undefined
                    }
                  />
                </SectionCard>
              </div>

              {!esGestor && (
                <SectionCard
                  titulo="Indicadores del área"
                  descripcion="Espacio para las métricas de productividad"
                  icono={Activity}
                >
                  <EmptyState
                    titulo="Aún no hay indicadores"
                    descripcion="Las métricas aparecerán cuando el área tenga registros y reuniones."
                  />
                </SectionCard>
              )}

              {esGestor && barras.length > 0 && (
                <SectionCard
                  titulo={mostrarActivos ? 'Usuarios por área' : 'Áreas por tipo'}
                  descripcion={
                    mostrarActivos
                      ? 'Distribución del personal y accesos habilitados por dependencia'
                      : 'Distribución de la estructura organizacional visible'
                  }
                  icono={Activity}
                  accion={
                    <div className="flex flex-wrap items-center gap-3 text-[8px]">
                      <span className="flex items-center gap-1 text-muted">
                        <span className="size-2 rounded-sm bg-brand-950" />
                        {mostrarActivos ? 'Registrados' : 'Total'}
                      </span>
                      {mostrarActivos && (
                        <span className="flex items-center gap-1 text-brand-700">
                          <span className="size-2 rounded-sm bg-brand-600" />
                          Activos
                        </span>
                      )}
                    </div>
                  }
                >
                  <div className="flex h-[180px] items-end gap-2 border-b border-line px-1">
                    {barras.map((barra) => (
                      <div
                        key={barra.etiqueta}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                      >
                        <span className="text-[9px] font-semibold text-ink">{barra.total}</span>

                        <div
                          className="flex w-full max-w-[46px] items-end justify-center gap-1"
                          style={{
                            height: `${Math.max(10, (barra.total / maximo) * 135)}px`,
                          }}
                        >
                          <div
                            className="h-full w-1/2 rounded-t-sm bg-brand-950/90"
                            title={`${barra.etiqueta}: ${barra.total} registrados`}
                          />

                          {mostrarActivos && (
                            <div
                              className="w-1/2 rounded-t-sm bg-brand-600"
                              style={{
                                height: `${barra.total === 0 ? 0 : (barra.activos / barra.total) * 100}%`,
                              }}
                              title={`${barra.etiqueta}: ${barra.activos} activos`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex gap-2 px-1">
                    {barras.map((barra) => (
                      <span
                        key={barra.etiqueta}
                        className="flex-1 truncate text-center text-[8px] text-muted"
                        title={barra.etiqueta}
                      >
                        {barra.etiqueta}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg bg-info-soft p-3">
                    <p className="text-[10px] font-semibold text-[#16426b]">
                      <Activity size={11} className="mr-1 inline text-brand-600" />
                      {resumen}
                    </p>
                  </div>
                </SectionCard>
              )}

              {esGestor && progresos.length > 0 && (
                <SectionCard
                  titulo="Estado de la estructura"
                  descripcion="Indicadores de completitud de la configuración institucional"
                  icono={Building2}
                  accion={<Badge tono="primario">Actualizado</Badge>}
                >
                  <div className="space-y-4">
                    {progresos.map((progreso) => {
                      const porcentaje = Math.round((progreso.valor / progreso.total) * 100)

                      return (
                        <div key={progreso.etiqueta}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
                            <span className="text-ink-soft">{progreso.etiqueta}</span>
                            <span className="font-semibold text-brand-700">{porcentaje}%</span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#e7eef7]">
                            <div
                              className="h-full rounded-full bg-brand-600 transition-all"
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </SectionCard>
              )}
            </div>

            <div className="space-y-4">
              <SectionCard
                titulo="Mi cuenta"
                descripcion="Información de la sesión actual"
                icono={UserRound}
                accion={
                  <Link
                    to="/perfil"
                    className="flex items-center gap-1 text-[9px] font-semibold text-brand-700 hover:underline"
                  >
                    Ver perfil
                    <ArrowUpRight size={11} />
                  </Link>
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-950 text-sm font-bold text-white">
                    {usuario ? inicialesDe(usuario.nombre_completo) : 'US'}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {usuario?.nombre_completo ?? 'Usuario'}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      @{usuario?.usuario ?? 'usuario'} · {usuario?.email ?? 'sin correo'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge tono="primario">{rolPrincipal}</Badge>
                  <Badge tono="secundario">{areaPrincipal}</Badge>
                </div>

                <dl className="mt-4 space-y-2.5 border-t border-line pt-3 text-[10px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Cargo</dt>
                    <dd className="text-right font-semibold text-ink">
                      {usuario?.cargo?.nombre ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="flex items-center gap-1 text-muted">
                      <Clock size={10} />
                      Último acceso
                    </dt>
                    <dd className="text-right font-semibold text-ink">
                      {usuario?.ultimo_acceso_at
                        ? tiempoRelativo(usuario.ultimo_acceso_at)
                        : '—'}
                    </dd>
                  </div>
                </dl>
              </SectionCard>

              {esGestor && usuarios !== null && (
                <SectionCard
                  titulo="Últimos accesos"
                  descripcion="Actividad reciente del personal"
                  icono={Clock}
                >
                  {ultimosAccesos.length === 0 ? (
                    <p className="py-3 text-center text-[10px] text-muted">
                      Sin accesos registrados.
                    </p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {ultimosAccesos.map((registro) => (
                        <li key={registro.id} className="flex items-center gap-2.5 py-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[9px] font-bold text-brand-700">
                            {inicialesDe(registro.nombre_completo)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-semibold text-ink">
                              {registro.nombre_completo}
                            </p>
                            <p className="truncate text-[8px] text-muted">
                              {registro.area?.nombre ?? 'Sin área'}
                            </p>
                          </div>

                          <span className="shrink-0 text-[8px] text-muted">
                            {registro.ultimo_acceso_at
                              ? tiempoRelativo(registro.ultimo_acceso_at)
                              : '—'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}
            </div>
          </div>

          <SectionCard
            titulo="Accesos rápidos"
            descripcion="Módulos disponibles para su rol"
            icono={ChevronRight}
          >
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {accesosVisibles.map((acceso) => (
                <Link
                  key={acceso.ruta}
                  to={acceso.ruta}
                  className="group flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-app text-brand-700 transition group-hover:bg-white">
                    <acceso.icono size={15} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-ink">
                      {acceso.texto}
                    </span>
                    <span className="block truncate text-[9px] text-muted">
                      {acceso.descripcion}
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
        </>
      )}
    </>
  )
}
