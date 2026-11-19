import { PageHeader } from '../components/molecules/PageHeader'
import { AreasManager } from '../components/organisms/AreasManager'

export function AreasPage() {
  return (
    <>
      <PageHeader titulo="Áreas" descripcion="Estructura organizacional visible para su usuario." />
      <AreasManager />
    </>
  )
}
