import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Spinner } from './components/atoms/Button'
import { AppLayout } from './components/templates/AppLayout'
import {
  CLAVES_CATALOGOS,
  CLAVES_CONFIGURACION_CREACION,
  CLAVES_TIPOS_REGISTRO,
} from './config/navegacion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ConfiguracionProvider, useConfiguracion } from './context/ConfiguracionContext'
import { AdministrarMiAreaPage } from './pages/AdministrarMiAreaPage'
import { AreasPage } from './pages/AreasPage'
import { CargosPage } from './pages/CargosPage'
import { CatalogosPage } from './pages/CatalogosPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PerfilPage } from './pages/PerfilPage'
import { PermisosPage } from './pages/PermisosPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ReunionesPage } from './pages/ReunionesPage'
import { RolesPage } from './pages/RolesPage'
import { SeccionesTrabajoPage } from './pages/SeccionesTrabajoPage'
import { TiposRegistroPage } from './pages/TiposRegistroPage'
import { UsuariosPage } from './pages/UsuariosPage'

function RutaPrivada() {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <div className="grid min-h-svh place-items-center bg-app">
        <Spinner />
      </div>
    )
  }

  if (usuario === null) {
    return <Navigate to="/ingresar" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />
  }

  return <Outlet />
}

function RutaConPermiso({ permiso }: { permiso: string }) {
  const { tienePermiso } = useAuth()

  return tienePermiso(permiso) ? <Outlet /> : <Navigate to="/" replace />
}

function RutaConAcceso({ permisos }: { permisos: string[] }) {
  const { tienePermiso } = useAuth()

  return permisos.some((permiso) => tienePermiso(permiso)) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  )
}

function RutaConModoConfiguracion({ permisos }: { permisos: string[] }) {
  const { tienePermiso } = useAuth()
  const { modoActivo } = useConfiguracion()

  return modoActivo && permisos.some((permiso) => tienePermiso(permiso)) ? (
    <Outlet />
  ) : (
    <Navigate to="/administrar-mi-area" replace />
  )
}

function Enrutador() {
  return (
    <Routes>
      <Route path="/ingresar" element={<LoginPage />} />
      <Route path="/recuperar-clave" element={<ForgotPasswordPage />} />
      <Route path="/restablecer-clave" element={<ResetPasswordPage />} />

      <Route element={<RutaPrivada />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="perfil" element={<PerfilPage />} />

          <Route element={<RutaConAcceso permisos={['reuniones.ver']} />}>
            <Route path="reuniones" element={<ReunionesPage />} />
          </Route>
          <Route element={<RutaConAcceso permisos={['registros.ver']} />}>
            <Route path="secciones-de-trabajo" element={<SeccionesTrabajoPage />} />
          </Route>
          <Route element={<RutaConAcceso permisos={CLAVES_CONFIGURACION_CREACION} />}>
            <Route path="administrar-mi-area" element={<AdministrarMiAreaPage />} />
          </Route>
          <Route element={<RutaConModoConfiguracion permisos={CLAVES_TIPOS_REGISTRO} />}>
            <Route
              path="administrar-mi-area/tipos-de-registro"
              element={<TiposRegistroPage />}
            />
          </Route>
          <Route element={<RutaConModoConfiguracion permisos={CLAVES_CATALOGOS} />}>
            <Route path="administrar-mi-area/catalogos" element={<CatalogosPage />} />
          </Route>

          <Route element={<RutaConPermiso permiso="areas.ver" />}>
            <Route path="areas" element={<AreasPage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="cargos.ver" />}>
            <Route path="cargos" element={<CargosPage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="roles.ver" />}>
            <Route path="roles" element={<RolesPage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="permisos.ver" />}>
            <Route path="permisos" element={<PermisosPage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="usuarios.ver" />}>
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfiguracionProvider>
          <Enrutador />
        </ConfiguracionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
