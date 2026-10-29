import { useState } from 'react'

type Tab = 'info' | 'eventos' | 'qr'

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Mi información' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'qr', label: 'Mi pase QR' },
]

const EVENTOS = [
  { id: 1, nombre: 'Taller de reciclaje', fecha: '2026-11-05', hora: '10:00', sala: 'Sala A', inscrito: true },
  { id: 2, nombre: 'Charla ambiental', fecha: '2026-11-12', hora: '15:30', sala: 'Sala B', inscrito: false },
]

export function BeneficiarioPanel() {
  const [tab, setTab] = useState<Tab>('info')
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Beneficiario</h2>
          <p className="text-xs text-zinc-500 mt-1">Tu información y eventos disponibles.</p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-zinc-900 dark:border-zinc-50 text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {tab === 'info' && (
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div><span className="text-zinc-500">Nombre:</span> Juan Pérez</div>
              <div><span className="text-zinc-500">Correo:</span> juan@example.com</div>
              <div><span className="text-zinc-500">Teléfono:</span> +56912345678</div>
            </div>
          )}
          {tab === 'eventos' && (
            <div className="space-y-3">
              {EVENTOS.map((e) => (
                <div key={e.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.nombre}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {e.fecha} · {e.hora} · {e.sala}
                    </div>
                    <div className={`text-xs mt-1 ${e.inscrito ? 'text-green-600' : 'text-amber-600'}`}>
                      {e.inscrito ? 'Inscrito' : 'No inscrito'}
                    </div>
                  </div>
                  {!e.inscrito && (
                    <button
                      onClick={() => setSelected(e.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Inscribirme
                    </button>
                  )}
                </div>
              ))}
              {selected && (
                <div className="text-sm text-green-600">
                  Inscrito en el evento #{selected}. Ve a "Mi pase QR".
                </div>
              )}
            </div>
          )}
          {tab === 'qr' && (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center">
              <p className="text-zinc-500 text-sm mb-4">Tu pase QR para el evento inscrito</p>
              <div className="mx-auto w-40 h-40 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 text-xs">
                QR placeholder
              </div>
              <p className="text-xs text-zinc-400 mt-3">Muestra este código al ingresar al evento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}