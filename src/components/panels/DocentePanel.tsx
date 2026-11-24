import { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { useRole } from '../../hooks/useRole'
import { decodeJwt } from '../../utils/jwt'
import { QRCodeSVG } from 'qrcode.react'
import {
  getOrCreateUsuario, getProyectosByCoordinador, createProyecto, updateProyecto, deleteProyecto,
  getEventosByProyecto, createEvento, updateEvento, deleteEvento, getMetricasEvento,
  type Proyecto, type Evento, type MetricasEvento, type Usuario,
} from '../../lib/syncpassApi'

type Tab = 'proyectos' | 'eventos' | 'informes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'informes', label: 'Informes' },
]

export function DocentePanel() {
  const auth = useAuth()
  const role = useRole()
  const idClaims = decodeJwt(auth.user?.id_token)
  const accessClaims = decodeJwt(auth.user?.access_token)
  const name = idClaims?.['given_name'] || idClaims?.['name'] || idClaims?.['preferred_username'] || 'Docente'
  const email = idClaims?.['email'] || accessClaims?.['email'] || auth.user?.profile?.email || ''
  const token = auth.user?.access_token

  const [tab, setTab] = useState<Tab>('proyectos')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [selectedProyecto, setSelectedProyecto] = useState<number | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [metricas, setMetricas] = useState<Record<number, MetricasEvento>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // form proyecto
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaTermino, setFechaTermino] = useState('')
  const [showCreateProyecto, setShowCreateProyecto] = useState(false)

  // edición proyecto
  const [editingProyecto, setEditingProyecto] = useState<number | null>(null)
  const [editPTitulo, setEditPTitulo] = useState('')
  const [editPDesc, setEditPDesc] = useState('')
  const [editPInicio, setEditPInicio] = useState('')
  const [editPTermino, setEditPTermino] = useState('')
  const [editPEstado, setEditPEstado] = useState('PLANIFICADO')

  // form evento
  const [evNombre, setEvNombre] = useState('')
  const [evDescripcion, setEvDescripcion] = useState('')
  const [evInicio, setEvInicio] = useState('')
  const [evTermino, setEvTermino] = useState('')
  const [evCupos, setEvCupos] = useState(25)
  const [evRecinto, setEvRecinto] = useState('')
  const [showCreateEvento, setShowCreateEvento] = useState(false)

  // edición evento
  const [editingEvento, setEditingEvento] = useState<number | null>(null)
  const [editENombre, setEditENombre] = useState('')
  const [editEDesc, setEditEDesc] = useState('')
  const [editEInicio, setEditEInicio] = useState('')
  const [editETermino, setEditETermino] = useState('')
  const [editECupos, setEditECupos] = useState(25)
  const [editERecinto, setEditERecinto] = useState('')
  const [editEEstado, setEditEEstado] = useState('PROGRAMADO')

  const [qrEvento, setQrEvento] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      if (!token) { setLoading(false); return }
      try {
        const u = await getOrCreateUsuario(token, email, name, role)
        if (mounted) setUsuario(u)
        if (u) {
          const ps = await getProyectosByCoordinador(token, u.id_usuario)
          if (mounted) {
            setProyectos(ps)
            if (ps.length) setSelectedProyecto(ps[0].id_proyecto)
          }
        }
      } catch (e) {
        if (mounted) setError((e as Error).message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (email && token) load()
    return () => { mounted = false }
  }, [email, name, role, token])

  useEffect(() => {
    if (!selectedProyecto || !token) return
    let mounted = true
    async function load() {
      const evs = await getEventosByProyecto(token!, selectedProyecto!)
      if (mounted) setEventos(evs)
      const m: Record<number, MetricasEvento> = {}
      await Promise.all(evs.map(async (e) => {
        m[e.id_evento] = await getMetricasEvento(token!, e.id_evento)
      }))
      if (mounted) setMetricas(m)
    }
    load()
    return () => { mounted = false }
  }, [selectedProyecto, token])

  const handleCreateProyecto = async () => {
    if (!usuario || !token || !titulo || !fechaInicio || !fechaTermino) return
    const p = await createProyecto(token, {
      titulo,
      descripcion: descripcion || null,
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino,
      estado: 'PLANIFICADO',
      id_unidad: 1,
      id_area: 1,
    }, usuario.id_usuario)
    if (p) {
      setProyectos((prev) => [p, ...prev])
      setSelectedProyecto(p.id_proyecto)
      setTitulo(''); setDescripcion(''); setFechaInicio(''); setFechaTermino('')
      setShowCreateProyecto(false)
    }
  }

  const handleCreateEvento = async () => {
    if (!selectedProyecto || !token || !evNombre || !evInicio || !evTermino) return
    const e = await createEvento(token, {
      id_proyecto: selectedProyecto,
      nombre: evNombre,
      descripcion: evDescripcion || null,
      fecha_inicio: evInicio,
      fecha_termino: evTermino,
      cupos_maximos: evCupos,
      recinto: evRecinto || null,
      direccion: null,
      latitud: null,
      longitud: null,
      radio_validacion_metros: 100,
      estado: 'PROGRAMADO',
    })
    if (e) {
      setEventos((prev) => [...prev, e])
      setEvNombre(''); setEvDescripcion(''); setEvInicio(''); setEvTermino(''); setEvRecinto('')
      setQrEvento(e.id_evento)
      setShowCreateEvento(false)
    }
  }

  const startEditProyecto = (p: Proyecto) => {
    setEditingProyecto(p.id_proyecto)
    setEditPTitulo(p.titulo)
    setEditPDesc(p.descripcion || '')
    setEditPInicio(p.fecha_inicio?.slice(0, 10) || '')
    setEditPTermino(p.fecha_termino?.slice(0, 10) || '')
    setEditPEstado(p.estado)
  }

  const saveEditProyecto = async (id: number) => {
    const updated = await updateProyecto(token!, id, {
      titulo: editPTitulo,
      descripcion: editPDesc || null,
      fecha_inicio: editPInicio,
      fecha_termino: editPTermino,
      estado: editPEstado,
    })
    if (updated) {
      setProyectos((prev) => prev.map((p) => (p.id_proyecto === id ? updated : p)))
      setEditingProyecto(null)
    }
  }

  const startEditEvento = (e: Evento) => {
    setEditingEvento(e.id_evento)
    setEditENombre(e.nombre)
    setEditEDesc(e.descripcion || '')
    setEditEInicio(e.fecha_inicio?.slice(0, 16) || '')
    setEditETermino(e.fecha_termino?.slice(0, 16) || '')
    setEditECupos(e.cupos_maximos)
    setEditERecinto(e.recinto || '')
    setEditEEstado(e.estado)
  }

  const saveEditEvento = async (id: number) => {
    const updated = await updateEvento(token!, id, {
      nombre: editENombre,
      descripcion: editEDesc || null,
      fecha_inicio: editEInicio,
      fecha_termino: editETermino,
      cupos_maximos: editECupos,
      recinto: editERecinto || null,
      estado: editEEstado,
    })
    if (updated) {
      setEventos((prev) => prev.map((e) => (e.id_evento === id ? updated : e)))
      setEditingEvento(null)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Docente</h2>
          <p className="text-xs text-zinc-500 mt-1">Proyectos, eventos, métricas e informes.</p>
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
          {loading && <p className="text-zinc-500 text-sm">Cargando...</p>}
          {error && <p className="text-red-500 text-sm">Error al cargar datos: {error}</p>}

          {!loading && tab === 'proyectos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Proyectos</h3>
                <button
                  onClick={() => setShowCreateProyecto((v) => !v)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {showCreateProyecto ? 'Cancelar' : '+ Crear proyecto'}
                </button>
              </div>

              {showCreateProyecto && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nuevo proyecto</h4>
                  <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  <div className="flex gap-2">
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <input type="date" value={fechaTermino} onChange={(e) => setFechaTermino(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  </div>
                  <button onClick={handleCreateProyecto} className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                    Crear proyecto
                  </button>
                </div>
              )}

              <div className="grid gap-3">
                {proyectos.length === 0 && <p className="text-zinc-500 text-sm">No tienes proyectos aún. Crea el primero.</p>}
                {proyectos.map((p) => (
                  editingProyecto === p.id_proyecto ? (
                    <div key={p.id_proyecto} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                      <input value={editPTitulo} onChange={(e) => setEditPTitulo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                      <textarea value={editPDesc} onChange={(e) => setEditPDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                      <div className="flex gap-2">
                        <input type="date" value={editPInicio} onChange={(e) => setEditPInicio(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                        <input type="date" value={editPTermino} onChange={(e) => setEditPTermino(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                      </div>
                      <select value={editPEstado} onChange={(e) => setEditPEstado(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50">
                        <option value="PLANIFICADO">PLANIFICADO</option>
                        <option value="EN_CURSO">EN_CURSO</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => saveEditProyecto(p.id_proyecto)} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Guardar</button>
                        <button onClick={() => setEditingProyecto(null)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div key={p.id_proyecto} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-50">{p.titulo}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{p.descripcion || 'Sin descripción'}</div>
                          <div className="text-xs text-zinc-500 mt-2">
                            {new Date(p.fecha_inicio).toLocaleDateString()} → {new Date(p.fecha_termino).toLocaleDateString()} · {p.estado}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedProyecto(p.id_proyecto); setTab('eventos') }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                          >
                            Ver eventos
                          </button>
                          <button
                            onClick={() => startEditProyecto(p)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('¿Eliminar este proyecto y sus eventos?')) return
                              const ok = await deleteProyecto(token!, p.id_proyecto)
                              if (ok) setProyectos((prev) => prev.filter((x) => x.id_proyecto !== p.id_proyecto))
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {!loading && tab === 'eventos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Eventos del proyecto</h3>
                <button
                  onClick={() => setShowCreateEvento((v) => !v)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {showCreateEvento ? 'Cancelar' : '+ Crear evento'}
                </button>
              </div>

              {showCreateEvento && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Crear evento con QR</h4>
                  <input value={evNombre} onChange={(e) => setEvNombre(e.target.value)} placeholder="Nombre del evento" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  <textarea value={evDescripcion} onChange={(e) => setEvDescripcion(e.target.value)} placeholder="Descripción" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  <div className="flex gap-2">
                    <input type="datetime-local" value={evInicio} onChange={(e) => setEvInicio(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <input type="datetime-local" value={evTermino} onChange={(e) => setEvTermino(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  </div>
                  <div className="flex gap-2">
                    <input type="number" value={evCupos} onChange={(e) => setEvCupos(Number(e.target.value))} placeholder="Cupos" className="w-24 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                    <input value={evRecinto} onChange={(e) => setEvRecinto(e.target.value)} placeholder="Recinto/Sala" className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                  </div>
                  <button onClick={handleCreateEvento} className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                    Crear evento
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {eventos.length === 0 && <p className="text-zinc-500 text-sm">No hay eventos en este proyecto.</p>}
                {eventos.map((e) => {
                  const m = metricas[e.id_evento]
                  if (editingEvento === e.id_evento) {
                    return (
                      <div key={e.id_evento} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                        <input value={editENombre} onChange={(ev) => setEditENombre(ev.target.value)} placeholder="Nombre" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                        <textarea value={editEDesc} onChange={(ev) => setEditEDesc(ev.target.value)} placeholder="Descripción" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                        <div className="flex gap-2">
                          <input type="datetime-local" value={editEInicio} onChange={(ev) => setEditEInicio(ev.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                          <input type="datetime-local" value={editETermino} onChange={(ev) => setEditETermino(ev.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                        </div>
                        <div className="flex gap-2">
                          <input type="number" value={editECupos} onChange={(ev) => setEditECupos(Number(ev.target.value))} placeholder="Cupos" className="w-24 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                          <input value={editERecinto} onChange={(ev) => setEditERecinto(ev.target.value)} placeholder="Recinto/Sala" className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50" />
                        </div>
                        <select value={editEEstado} onChange={(ev) => setEditEEstado(ev.target.value)} className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50">
                          <option value="PROGRAMADO">PROGRAMADO</option>
                          <option value="EN_CURSO">EN_CURSO</option>
                          <option value="FINALIZADO">FINALIZADO</option>
                          <option value="CANCELADO">CANCELADO</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => saveEditEvento(e.id_evento)} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">Guardar</button>
                          <button onClick={() => setEditingEvento(null)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200">Cancelar</button>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={e.id_evento} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.nombre}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(e.fecha_inicio).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {e.recinto ?? 'Sin sala'} · Cupos: {e.cupos_maximos}
                      </div>
                      {m && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                            <div className="text-xs text-zinc-500">Asistencia</div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-50">{m.totalAsistencias}/{m.totalInscritos} ({m.porcentajeAsistencia}%)</div>
                          </div>
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                            <div className="text-xs text-zinc-500">Encuestas</div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-50">{m.encuestasRespondidas}/{m.totalInscritos} ({m.porcentajeEncuestas}%)</div>
                          </div>
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                            <div className="text-xs text-zinc-500">Satisfacción</div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-50">{m.satisfaccionPromedio}/4</div>
                          </div>
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                            <div className="text-xs text-zinc-500">Comentarios</div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-50">{m.comentarios.length}</div>
                          </div>
                        </div>
                      )}
                      {m && m.comentarios.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-zinc-500 mb-1">Comentarios:</div>
                          <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                            {m.comentarios.map((c, i) => <li key={i}>• {c}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setQrEvento(qrEvento === e.id_evento ? null : e.id_evento)}
                          className="text-xs px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
                        >
                          {qrEvento === e.id_evento ? 'Ocultar QR' : 'Ver QR'}
                        </button>
                        <button
                          onClick={() => startEditEvento(e)}
                          className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('¿Eliminar este evento?')) return
                            const ok = await deleteEvento(token!, e.id_evento)
                            if (ok) setEventos((prev) => prev.filter((x) => x.id_evento !== e.id_evento))
                          }}
                          className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                      {qrEvento === e.id_evento && (
                        <div className="mt-3 inline-block p-3 bg-white rounded-lg">
                          <QRCodeSVG value={`syncpass:evento:${e.id_evento}`} size={120} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && tab === 'informes' && (() => {
            const totalInscritos = Object.values(metricas).reduce((a, m) => a + m.totalInscritos, 0)
            const totalAsistencias = Object.values(metricas).reduce((a, m) => a + m.totalAsistencias, 0)
            const totalEncuestas = Object.values(metricas).reduce((a, m) => a + m.encuestasRespondidas, 0)
            const promedio = totalEncuestas > 0
              ? (Object.values(metricas).reduce((a, m) => a + m.satisfaccionPromedio * m.encuestasRespondidas, 0) / totalEncuestas).toFixed(2)
              : '0'
            const comentarios = Object.values(metricas).flatMap((m) => m.comentarios)
            const proyecto = proyectos.find((p) => p.id_proyecto === selectedProyecto)

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Informes de impacto</h3>
                  {proyectos.length > 1 && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-zinc-500">Proyecto:</label>
                      <select
                        value={selectedProyecto ?? ''}
                        onChange={(e) => setSelectedProyecto(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50 text-sm"
                      >
                        {proyectos.map((p) => (
                          <option key={p.id_proyecto} value={p.id_proyecto}>{p.titulo}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Resumen del proyecto</h4>
                  <p className="text-xs text-zinc-500 mb-2">{proyecto?.titulo ?? 'Selecciona un proyecto'}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                      <div className="text-xs text-zinc-500">Eventos</div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{eventos.length}</div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                      <div className="text-xs text-zinc-500">Inscritos</div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{totalInscritos}</div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                      <div className="text-xs text-zinc-500">Asistencias</div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{totalAsistencias}</div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                      <div className="text-xs text-zinc-500">Encuestas</div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{totalEncuestas}</div>
                    </div>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2 text-sm">
                    <div className="text-xs text-zinc-500">Satisfacción promedio</div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">{promedio}/4</div>
                  </div>
                  {comentarios.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-zinc-500 mb-1">Comentarios:</div>
                      <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        {comentarios.map((c, i) => <li key={i}>• {c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                <textarea
                  className="w-full min-h-[160px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50"
                  placeholder="Redacta aquí el informe de impacto del proyecto..."
                />
                <button className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                  Guardar informe
                </button>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}