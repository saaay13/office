import { UserRound } from 'lucide-react'
import { PageHeader } from '../components/molecules/PageHeader'
import { PerfilForm } from '../components/organisms/PerfilForm'

export function PerfilPage() {
  return (
    <>
      <PageHeader
        titulo="Mi perfil"
        descripcion="Datos personales, información institucional y seguridad de su cuenta."
        etiqueta="CUENTA"
        icono={UserRound}
      />
      <PerfilForm />
    </>
  )
}
