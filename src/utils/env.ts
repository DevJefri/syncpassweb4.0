const env = import.meta.env as Record<string, string | undefined>

export function getEnv(key: string, fallback?: string): string | undefined {
  const withVite = `VITE_${key}`
  return env[withVite] ?? env[key] ?? fallback
}

export function getRequiredEnv(key: string, fallback?: string): string {
  const value = getEnv(key, fallback)
  if (!value) {
    throw new Error(`Falta la variable de entorno ${key} (se probó VITE_${key} y ${key})`)
  }
  return value
}
