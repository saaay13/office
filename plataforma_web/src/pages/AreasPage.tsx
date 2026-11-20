import { Building2 } from 'lucide-react'
import { PageHeader } from '../components/molecules/PageHeader'
import { AreasManager } from '../components/organisms/AreasManager'

export function AreasPage() {
  return (
    <>
      <PageHeader
        titulo="Áreas"
        descripcion="Estructura organizacional visible para su usuario y jerarquía de dependencias."
        etiqueta="ORGANIZACIÓN"
        icono={Building2}
      />
      <AreasManager />
    </>
  )
}
