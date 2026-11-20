import { Users } from 'lucide-react'
import { PageHeader } from '../components/molecules/PageHeader'
import { UsuariosManager } from '../components/organisms/UsuariosManager'

export function UsuariosPage() {
  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Gestión de cuentas, roles y áreas asignadas al personal institucional."
        etiqueta="SEGURIDAD"
        icono={Users}
      />
      <UsuariosManager />
    </>
  )
}
