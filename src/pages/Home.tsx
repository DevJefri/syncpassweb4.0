import { useAuth } from 'react-oidc-context'
import { Dashboard } from './Dashboard'

export function Home() {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-red-500 rounded-full animate-spin" />
          <span className="text-white/70 text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#2c2d35]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6 max-w-md text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Error de autenticación</div>
          <p className="text-white/70 text-sm">{auth.error.message}</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#2c2d35]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-10">
            <h1 className="text-3xl font-bold text-white text-center tracking-[0.25em] mb-2">SYNCPASS</h1>
            <div className="w-2/3 mx-auto h-px bg-white/10 mb-8" />

            <button
              onClick={() => auth.signinRedirect()}
              className="w-full py-3 rounded-lg font-bold text-white tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to bottom, #ff6b6b, #ee5253)' }}
            >
              Iniciar sesión
            </button>

            <div className="mt-8 text-center space-y-1">
              <p className="text-xs text-white/40">Acceso seguro mediante AWS Cognito</p>
              <p className="text-xs text-white/40">Realizado por Jeferson Aquino y Karl Obreque</p>
              <p className="text-xs text-white/30">© Todos los derechos reservados</p>
              <p className="text-xs text-white/30 mt-2">Desarrollado por Duoc UC</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard />
}