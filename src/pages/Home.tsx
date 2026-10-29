import { useAuth } from 'react-oidc-context'
import { Dashboard } from './Dashboard'

export function Home() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-slate-600 text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-md text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error de autenticación</div>
          <p className="text-slate-600 text-sm">{auth.error.message}</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">SyncPass</h1>
            <p className="text-slate-500 mb-1 text-sm">Sistema de gestión de asistencia y eventos</p>
            <p className="text-slate-400 mb-8 text-xs">Desarrollado por Duoc UC</p>
            <button
              onClick={() => auth.signinRedirect()}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-600/20"
            >
              Iniciar sesión
            </button>
            <p className="text-xs text-slate-400 mt-6">Acceso seguro mediante AWS Cognito</p>
            <p className="text-xs text-slate-400 mt-1">Realizado por Jeferson Aquino y Karl Obreque</p>
            <p className="text-xs text-slate-300 mt-1">© Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard />
}