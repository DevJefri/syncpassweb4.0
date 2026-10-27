import { createClient } from '@supabase/supabase-js'

export const supabaseUrl: string = __SUPABASE_URL__
export const supabaseAnonKey: string = __SUPABASE_ANON_KEY__

/** false si faltan las variables: la app sigue abriendo y avisa en pantalla en vez de quedarse en blanco. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Cliente anónimo (publishable/anon key, protegido por RLS).
// La sesión del usuario la maneja Cognito, no Supabase Auth.
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null

/**
 * Cliente que envía el token de Cognito a Supabase (Third-party Auth).
 * Requiere configurar Cognito en Supabase: Authentication > Sign In / Providers > Third-Party Auth.
 */
export function createSupabaseWithToken(getToken: () => string | undefined) {
  if (!supabaseConfigured) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => getToken() ?? null,
  })
}
