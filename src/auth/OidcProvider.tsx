import { AuthProvider } from 'react-oidc-context'
import { WebStorageStateStore } from 'oidc-client-ts'
import { authConfig } from './authConfig'

export function OidcProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      {...authConfig}
      userStore={new WebStorageStateStore({ store: window.localStorage })}
      onSigninCallback={(_user) => {
        window.history.replaceState({}, document.title, window.location.pathname)
      }}
    >
      {children}
    </AuthProvider>
  )
}
