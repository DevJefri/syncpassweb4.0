import { useEffect, useState } from 'react'
import { DocentePanel } from './DocentePanel'
import { VoluntarioPanel } from './VoluntarioPanel'
import { BeneficiarioPanel } from './BeneficiarioPanel'
import { getUsuarios, getRoles, createUsuario, updateUsuario, deleteUsuario, type Usuario } from '../../lib/syncpass'

type Tab = 'usuarios' | 'docente' | 'voluntario' | 'beneficiario'

const TABS: { id: Tab; label: string }[] = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'docente', label: 'Vista Docente' },
  { id: 'voluntario', label: 'Vista Voluntario' },
  { id: 'beneficiario', label: 'Vista Beneficiario' },
]

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<{ id_rol: number; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // form create/edit
  const [fNombreUsuario, setFNombreUsuario] = useState('')
  const [fNombreMostrar, setFNombreMostrar] = useState('')
  const [fCorreo, setFCorreo] = useState('')
  const [fIdRol, setFIdRol] = useState<number>(1)
  const [fEstado, setFEstado] = useState('ACTIVO')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const [us, rs] = await Promise.all([getUsuarios(), getRoles()])
      if (mounted) {
        setUsuarios(us)
        setRoles(rs.map((r: any) => ({ id_rol: r.id_rol, nombre: r.nombre })))
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setFNombreUsuario(''); setFNombreMostrar(''); setFCorreo(''); setFIdRol(roles[0]?.id_rol ?? 1); setFEstado('ACTIVO'); setEditingId(null); setShowCreate(false)
  }

  const startEdit = (u: Usuario) => {
    setEditingId(u.id_usuario)
    setFNombreUsuario(u.nombre_usuario)
    setFNombreMostrar(u.nombre_mostrar)
    setFCorreo(u.correo)
    setFIdRol(u.id_rol)
    setFEstado(u.estado)
    setShowCreate(true)
  }

  const handleSave = async () => {
    if (editingId) {
      const updated = await updateUsuario(editingId, {
        nombre_usuario: fNombreUsuario,
        nombre_mostrar: fNombreMostrar,
        correo: fCorreo,
        id_rol: fIdRol,
        estado: fEstado,
      })
      if (updated) {
        setUsuarios((prev) => prev.map((u) => (u.id_usuario === editingId ? { ...u, ...updated, rol_nombre: roles.find((r) => r.id_rol === fIdRol)?.nombre } : u)))
        resetForm()
      }
    } else {
      const created = await createUsuario({
        id_rol: fIdRol,
        nombre_usuario: fNombreUsuario,
        nombre_mostrar: fNombreMostrar,
        correo: fCorreo,
        estado: fEstado,
      } as any)
      if (created) {
        setUsuarios((prev) => [...prev, { ...created, rol_nombre: roles.find((r) => r.id_rol === fIdRol)?.nombre }])
        resetForm()
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    const ok = await deleteUsuario(id)
    if (ok) setUsuarios((prev) => prev.filter((u) => u.id_usuario !== id))
  }

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
          {loading && tab === 'usuarios' && <p className="text-zinc-500 text-sm">Cargando...</p>}

          {!loading && tab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Usuarios ({usuarios.length})</h3>
                <button
                  onClick={() => { resetForm(); setShowCreate(true) }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  + Nuevo usuario
                </button>
              </div>

              {showCreate && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={fNombreUsuario} onChange={(e) => setFNombreUsuario(e.target.value)} placeholder="Nombre de usuario" className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <input value={fNombreMostrar} onChange={(e) => setFNombreMostrar(e.target.value)} placeholder="Nombre a mostrar" className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <input value={fCorreo} onChange={(e) => setFCorreo(e.target.value)} placeholder="Correo" className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <select value={fIdRol} onChange={(e) => setFIdRol(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50">
                      {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                    </select>
                    <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50">
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="BLOQUEADO">BLOQUEADO</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                      {editingId ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                    <button onClick={resetForm} className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="py-2">ID</th>
                      <th className="py-2">Usuario</th>
                      <th className="py-2">Nombre</th>
                      <th className="py-2">Correo</th>
                      <th className="py-2">Rol</th>
                      <th className="py-2">Estado</th>
                      <th className="py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id_usuario} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 text-zinc-500">{u.id_usuario}</td>
                        <td className="py-2 text-zinc-900 dark:text-zinc-50">{u.nombre_usuario}</td>
                        <td className="py-2 text-zinc-600 dark:text-zinc-400">{u.nombre_mostrar}</td>
                        <td className="py-2 text-zinc-600 dark:text-zinc-400">{u.correo}</td>
                        <td className="py-2">{u.rol_nombre ?? u.id_rol}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {u.estado}
                          </span>
                        </td>
                        <td className="py-2 space-x-2">
                          <button onClick={() => startEdit(u)} className="text-xs text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDelete(u.id_usuario)} className="text-xs text-red-600 hover:underline">Eliminar</button>
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