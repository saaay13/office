import { Link } from 'react-router-dom'
import { Badge } from '../components/atoms/Badge'
import { Card } from '../components/atoms/Card'
import { PageHeader } from '../components/molecules/PageHeader'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { usuario, permisos } = useAuth()

  return (
    <>
      <PageHeader
        titulo={`Bienvenido, ${usuario?.nombres ?? 'usuario'}`}
        descripcion="Panel de acceso a la plataforma de control de productividad."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Área asignada</p>
          <p className="mt-2 text-xl font-semibold text-primary-700">{usuario?.area?.nombre ?? '—'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{usuario?.area?.codigo ?? 'Sin código'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rol</p>
          <p className="mt-2 text-xl font-semibold text-secondary-700">{usuario?.rol?.nombre ?? '—'}</p>
          <p className="mt-1 text-sm text-muted-foreground">{usuario?.rol?.clave ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Permisos activos</p>
          <p className="mt-2 text-xl font-semibold text-primary-700">{permisos.length}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {permisos.slice(0, 4).map((permiso) => (
              <Badge key={permiso} tono="info">{permiso}</Badge>
            ))}
            {permisos.length > 4 && <Badge tono="neutro">+{permisos.length - 4}</Badge>}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <h3 className="font-semibold text-primary-700">Organización y acceso</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Las áreas, cargos, roles, permisos y usuarios están disponibles según las acciones autorizadas para su rol.
          Cada usuario visualiza únicamente la información de su área.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/areas" className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100">
            Ver áreas
          </Link>
          <Link to="/perfil" className="rounded-md bg-secondary-50 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-100">
            Mi perfil
          </Link>
        </div>
      </Card>
    </>
  )
}
