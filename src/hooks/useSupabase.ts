import { useEffect, useMemo, useRef } from 'react'
import { useAuth } from 'react-oidc-context'
import { createSupabaseWithToken } from '../lib/supabase'

/** Cliente de Supabase que usa el id_token de Cognito de la sesión actual (o null si no está configurado). */
export function useSupabase() {
  const auth = useAuth()
  const tokenRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    tokenRef.current = auth.user?.id_token
  }, [auth.user?.id_token])
  return useMemo(() => createSupabaseWithToken(() => tokenRef.current), [])
}
