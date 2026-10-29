import { useState } from 'react'

type Tab = 'eventos' | 'scanner' | 'inscritos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'scanner', label: 'Abrir scanner' },
  { id: 'inscritos', label: 'Lista de inscritos' },
]

const EVENTOS = [
  { id: 1, nombre: 'Taller de reciclaje', sala: 'Sala A', cupos: 25, hora: '10:00' },
  { id: 2, nombre: 'Charla ambiental', sala: 'Sala B', cupos: 40, hora: '15:30' },
]

export function VoluntarioPanel() {
  const [tab, setTab] = useState<Tab>('eventos')

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Voluntario</h2>
          <p className="text-xs text-zinc-500 mt-1">Eventos asignados, scanner y lista de inscritos.</p>
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
          {tab === 'eventos' && (
            <div className="space-y-3">
              {EVENTOS.map((e) => (
                <div key={e.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.nombre}</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Sala: {e.sala} · Cupos: {e.cupos} · Hora: {e.hora}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'scanner' && (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center">
              <p className="text-zinc-500 text-sm mb-4">Escáner de códigos QR de asistencia</p>
              <button className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                Abrir cámara
              </button>
              <p className="text-xs text-zinc-400 mt-3">(Placeholder: integrar librería de scanner QR)</p>
            </div>
          )}
          {tab === 'inscritos' && (
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Lista de inscritos (evento seleccionado)</h3>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>1. Juan Pérez — Presente</li>
                <li>2. María López — Ausente</li>
                <li>3. Carlos Ruiz — Presente</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}