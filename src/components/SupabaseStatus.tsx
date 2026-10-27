import { useState } from 'react'
import { supabase, supabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase'

type Result = { ok: boolean; message: string } | null

export function SupabaseStatus() {
  const [loading, setLoading] = useState(false)
  const [conn, setConn] = useState<Result>(null)
  const [table, setTable] = useState('')
  const [tableRes, setTableRes] = useState<Result>(null)

  async function testConnection() {
    setLoading(true)
    setConn(null)
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } })
      setConn(
        res.ok
          ? { ok: true, message: `Conectado a Supabase (HTTP ${res.status}). La API key es válida.` }
          : { ok: false, message: `Supabase respondió HTTP ${res.status}. Revisa la API key.` },
      )
    } catch (e) {
      setConn({ ok: false, message: `No se pudo conectar: ${(e as Error).message}` })
    } finally {
      setLoading(false)
    }
  }

  async function testTable() {
    if (!supabase || !table.trim()) return
    setTableRes(null)
    const { data, error, count } = await supabase.from(table.trim()).select('*', { count: 'exact' }).limit(5)
    setTableRes(
      error
        ? { ok: false, message: `${error.code ?? ''} ${error.message}` }
        : { ok: true, message: `OK: ${count ?? data.length} fila(s). Muestra: ${JSON.stringify(data).slice(0, 300)}` },
    )
  }

  const badge = (r: Result) =>
    r && <div className={`mt-2 text-sm break-words ${r.ok ? 'text-green-600' : 'text-red-500'}`}>{r.message}</div>

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Supabase</h2>
          <p className="text-xs text-zinc-500 mt-1 break-all">{supabaseUrl || 'Sin configurar'}</p>
        </div>
        {!supabaseConfigured ? (
          <div className="px-6 py-5 text-left text-sm text-red-500">
            Faltan SUPABASE_URL y SUPABASE_ANON_KEY. Agrégalas en el .env (local) o en Vercel → Settings →
            Environment Variables y vuelve a compilar/desplegar.
          </div>
        ) : (
          <div className="px-6 py-5 text-left space-y-5">
            <div>
              <button
                onClick={testConnection}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? 'Probando...' : 'Probar conexión'}
              </button>
              {badge(conn)}
            </div>
            <div>
              <div className="flex gap-2">
                <input
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="nombre de una tabla (ej: notes)"
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50"
                />
                <button
                  onClick={testTable}
                  className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                >
                  Leer tabla
                </button>
              </div>
              {badge(tableRes)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
