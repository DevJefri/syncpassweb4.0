import { useState } from 'react'
import { DocentePanel } from './DocentePanel'
import { VoluntarioPanel } from './VoluntarioPanel'
import { BeneficiarioPanel } from './BeneficiarioPanel'

type Tab = 'usuarios' | 'docente' | 'voluntario' | 'beneficiario'

const TABS: { id: Tab; label: string }[] = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'docente', label: 'Vista Docente' },
  { id: 'voluntario', label: 'Vista Voluntario' },
  { id: 'beneficiario', label: 'Vista Beneficiario' },
]

const USUARIOS = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Beneficiario', activo: true },
  { id: 2, nombre: 'María López', email: 'maria@example.com', rol: 'Voluntario', activo: true },
  { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@example.com', rol: 'Docente', activo: false },
]

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('usuarios')

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Administrador</h2>
          <p className="text-xs text-zinc-500 mt-1">Gestión de usuarios y acceso a todas las vistas.</p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 flex-wrap">
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
          {tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Usuarios</h3>
                <button className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                  + Nuevo usuario
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="py-2">Nombre</th>
                      <th className="py-2">Correo</th>
                      <th className="py-2">Rol</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {USUARIOS.map((u) => (
                      <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 text-zinc-900 dark:text-zinc-50">{u.nombre}</td>
                        <td className="py-2 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                        <td className="py-2">{u.rol}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-2 space-x-2">
                          <button className="text-xs text-blue-600 hover:underline">Editar</button>
                          <button className="text-xs text-red-600 hover:underline">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === 'docente' && <DocentePanel />}
          {tab === 'voluntario' && <VoluntarioPanel />}
          {tab === 'beneficiario' && <BeneficiarioPanel />}
        </div>
      </div>
    </div>
  )
}