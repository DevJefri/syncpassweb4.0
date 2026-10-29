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

  const name =
    auth.user?.profile?.given_name ||
    auth.user?.profile?.name ||
    auth.user?.profile?.preferred_username ||
    'Usuario'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-[#2c2d35]/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SyncPass</h1>
              <p className="text-xs text-white/50">{role} · {name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              auth.removeUser().then(() => {
                window.location.href = logoutUrl
              })
            }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/10"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {role === 'Administrador' && <AdminPanel />}
        {role === 'Docente' && <DocentePanel />}
        {role === 'Voluntario' && <VoluntarioPanel />}
        {role === 'Beneficiario' && <BeneficiarioPanel />}
        {role === 'Desconocido' && (
          <div className="text-center text-slate-500 mt-10">
            No se reconoció tu rol. Contacta al administrador.
          </div>
        )}
      </main>
    </div>
  )
}