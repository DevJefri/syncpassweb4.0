import { useAuth } from 'react-oidc-context'
import { useRole } from '../hooks/useRole'
import { authConfig } from '../auth/authConfig'
import { AdminPanel } from '../components/panels/AdminPanel'
import { DocentePanel } from '../components/panels/DocentePanel'
import { VoluntarioPanel } from '../components/panels/VoluntarioPanel'
import { BeneficiarioPanel } from '../components/panels/BeneficiarioPanel'

export function Dashboard() {
  const auth = useAuth()
  const role = useRole()

  const logoutUrl = `${authConfig.metadata.end_session_endpoint}?client_id=${authConfig.client_id}&logout_uri=${encodeURIComponent(authConfig.post_logout_redirect_uri!)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Syncpass</h1>
            <p className="text-sm text-zinc-500 mt-1">Rol: {role}</p>
          </div>
          <button
            onClick={() => {
              auth.removeUser().then(() => {
                window.location.href = logoutUrl
              })
            }}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        {role === 'Administrador' && <AdminPanel />}
        {role === 'Docente' && <DocentePanel />}
        {role === 'Voluntario' && <VoluntarioPanel />}
        {role === 'Beneficiario' && <BeneficiarioPanel />}
        {role === 'Desconocido' && (
          <div className="text-center text-zinc-500 mt-10">
            No se reconoció tu rol. Contacta al administrador.
          </div>
        )}
      </div>
    </div>
  )
}