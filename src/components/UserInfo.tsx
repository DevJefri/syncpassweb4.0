import { useAuth } from 'react-oidc-context'
import { decodeJwt, formatEpoch } from '../utils/jwt'

export function UserInfo() {
  const auth = useAuth()
  const accessToken = auth.user?.access_token
  const idToken = auth.user?.id_token

  const accessClaims = decodeJwt(accessToken)
  const idClaims = decodeJwt(idToken)

  const roles = accessClaims?.['cognito:groups'] || idClaims?.['cognito:groups'] || []
  const role = Array.isArray(roles) && roles.length > 0 ? roles.join(', ') : '-'
  const name =
    idClaims?.['given_name'] ||
    idClaims?.['name'] ||
    idClaims?.['nickname'] ||
    idClaims?.['preferred_username'] ||
    accessClaims?.['username'] ||
    auth.user?.profile?.name ||
    '-'
  const email = idClaims?.['email'] || accessClaims?.['email'] || auth.user?.profile?.email || '-'
  const authTime = accessClaims?.['auth_time'] || idClaims?.['auth_time']
  const connectionTime = formatEpoch(authTime)

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Información de sesión</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-5 text-left">
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Rol</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-50 break-words">{role}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Nombre</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-50 break-words">{name}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Correo</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-50 break-words">{email}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">Tiempo de conexión</div>
            <div className="mt-1 text-zinc-900 dark:text-zinc-50 break-words">{connectionTime}</div>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">access_token</div>
              <button
                onClick={() => navigator.clipboard.writeText(accessToken || '')}
                className="text-xs px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
              >
                Copiar
              </button>
            </div>
            <div className="w-full overflow-x-auto rounded-lg bg-zinc-950 text-zinc-100 text-xs p-3">
              <pre className="whitespace-pre-wrap break-all">{accessToken}</pre>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">id_token</div>
              <button
                onClick={() => navigator.clipboard.writeText(idToken || '')}
                className="text-xs px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
              >
                Copiar
              </button>
            </div>
            <div className="w-full overflow-x-auto rounded-lg bg-zinc-950 text-zinc-100 text-xs p-3">
              <pre className="whitespace-pre-wrap break-all">{idToken}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
