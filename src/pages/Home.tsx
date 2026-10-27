import { useAuth } from 'react-oidc-context'
import { UserInfo } from '../components/UserInfo'
import { SupabaseStatus } from '../components/SupabaseStatus'
import { authConfig } from '../auth/authConfig'

export function Home() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-zinc-600 dark:text-zinc-300">Cargando...</div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-red-500">Error: {auth.error.message}</div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Syncpass</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">Inicia sesión con Cognito para continuar</p>
          <button
            onClick={() => auth.signinRedirect()}
            className="w-full px-6 py-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors font-medium"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  const logoutUrl = `${authConfig.metadata.end_session_endpoint}?client_id=${authConfig.client_id}&logout_uri=${encodeURIComponent(authConfig.post_logout_redirect_uri!)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Syncpass</h1>
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
        <UserInfo />
        <SupabaseStatus />
      </div>
    </div>
  )
}
