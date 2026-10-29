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
          {/* Tarjeta glassmorphism */}
          <div className="bg-[#2c2d35]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-10">
            {/* Título */}
            <h1 className="text-3xl font-bold text-white text-center tracking-[0.25em] mb-2">WELCOME</h1>
            <div className="w-2/3 mx-auto h-px bg-white/10 mb-8" />

            {/* Campo Username */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#1a1b22] border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-red-400/50 transition-colors"
                  readOnly
                  value="Ingresa con Cognito"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#1a1b22] border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-red-400/50 transition-colors"
                  readOnly
                  value="••••••••"
                />
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1b22] border-white/10 accent-red-500" />
                Remember me
              </label>
              <a href="#" className="text-white/50 hover:text-white/80 transition-colors">Forgot Password?</a>
            </div>

            {/* Botón LOGIN */}
            <button
              onClick={() => auth.signinRedirect()}
              className="w-full py-3 rounded-lg font-bold text-white tracking-widest transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to bottom, #ff6b6b, #ee5253)' }}
            >
              LOGIN
            </button>

            {/* Créditos */}
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