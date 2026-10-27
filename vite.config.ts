import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Con prefijo '' carga TODAS las variables: las del archivo .env (local)
  // y las del panel de Vercel (process.env), con o sin prefijo VITE_.
  const env = loadEnv(mode, process.cwd(), '')

  // Toma la primera variable que exista, en orden de prioridad.
  const pick = (...keys: string[]) => keys.map((k) => env[k]).find(Boolean) ?? ''

  return {
    plugins: [react(), tailwindcss()],
    // Solo se inyectan estas dos (son públicas por diseño). Nunca agregues
    // service_role / secret key / jwt secret aquí.
    define: {
      __SUPABASE_URL__: JSON.stringify(
        pick('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      ),
      __SUPABASE_ANON_KEY__: JSON.stringify(
        pick(
          'SUPABASE_ANON_KEY',
          'VITE_SUPABASE_ANON_KEY',
          'SUPABASE_PUBLISHABLE_KEY',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        ),
      ),
    },
  }
})
