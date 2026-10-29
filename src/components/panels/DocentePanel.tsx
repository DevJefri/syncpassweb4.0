import { useState } from 'react'

type Tab = 'proyectos' | 'eventos' | 'informes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'informes', label: 'Informes' },
]

export function DocentePanel() {
  const [tab, setTab] = useState<Tab>('proyectos')

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Docente</h2>
          <p className="text-xs text-zinc-500 mt-1">Gestión de proyectos, eventos e informes de impacto.</p>
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
          {tab === 'proyectos' && <ProyectosTab />}
          {tab === 'eventos' && <EventosTab />}
          {tab === 'informes' && <InformesTab />}
        </div>
      </div>
    </div>
  )
}

function ProyectosTab() {
  const [proyectos] = useState([
    { id: 1, nombre: 'Proyecto Alpha', asistencia: 72, encuestas: 60, satisfaccion: 3.4, comentarios: 12 },
    { id: 2, nombre: 'Proyecto Beta', asistencia: 85, encuestas: 70, satisfaccion: 3.8, comentarios: 8 },
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Proyectos</h3>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
          + Nuevo proyecto
        </button>
      </div>
      <div className="grid gap-3">
        {proyectos.map((p) => (
          <div key={p.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="font-medium text-zinc-900 dark:text-zinc-50">{p.nombre}</div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div>Asistencia: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{p.asistencia}%</span></div>
              <div>Encuestas: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{p.encuestas}%</span></div>
              <div>Satisfacción: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{p.satisfaccion}/4</span></div>
              <div>Comentarios: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{p.comentarios}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="text-xs px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">Ver asistencias</button>
              <button className="text-xs px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200">Ver comentarios</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventosTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Eventos</h3>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
          + Crear evento con QR
        </button>
      </div>
      <p className="text-sm text-zinc-500">Aquí se listarán los eventos creados, con su código QR, quórum mínimo y cumplimiento.</p>
      <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center text-zinc-500 text-sm">
        Sin eventos aún. Crea el primero.
      </div>
    </div>
  )
}

function InformesTab() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Informes de impacto</h3>
      <textarea
        className="w-full min-h-[160px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50"
        placeholder="Redacta aquí el informe de impacto del proyecto..."
      />
      <button className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
        Guardar informe
      </button>
    </div>
  )
}