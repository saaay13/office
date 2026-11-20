import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/molecules/PageHeader'
import { RolesManager } from '../components/organisms/RolesManager'

export function RolesPage() {
  return (
    <>
      <PageHeader
        titulo="Roles"
        descripcion="Perfiles de acceso y acciones habilitadas para cada rol del sistema."
        etiqueta="SEGURIDAD"
        icono={ShieldCheck}
      />
      <RolesManager />
    </>
  )
}
