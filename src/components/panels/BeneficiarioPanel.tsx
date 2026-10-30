import { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { useRole } from '../../hooks/useRole'
import { decodeJwt } from '../../utils/jwt'
import { QRCodeSVG } from 'qrcode.react'
import { getOrCreateUsuario, getEventos, getInscripcionesByUsuario, inscribirse, desinscribirse, registrarEncuesta, type Evento, type Inscripcion, type Usuario } from '../../lib/syncpassApi'

export function BeneficiarioPanel() {
  const auth = useAuth()
  const role = useRole()
  const [tab, setTab] = useState<'info' | 'eventos' | 'qr'>('info')
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [qrEvento, setQrEvento] = useState<number | null>(null)
  const [encuestaEvento, setEncuestaEvento] = useState<number | null>(null)
  const [calificacion, setCalificacion] = useState(4)
  const [comentarios, setComentarios] = useState('')
  const [error, setError] = useState<string | null>(null)

  const idClaims = decodeJwt(auth.user?.id_token)
  const accessClaims = decodeJwt(auth.user?.access_token)
  const name = idClaims?.['given_name'] || idClaims?.['name'] || idClaims?.['preferred_username'] || '-'
  const email = idClaims?.['email'] || accessClaims?.['email'] || auth.user?.profile?.email || ''
  const token = auth.user?.access_token

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const u = await getOrCreateUsuario(token!, email, name, role)
        const evs = await getEventos(token!)
        const ins = u ? await getInscripcionesByUsuario(token!, u.id_usuario) : []
        if (mounted) {
          setUsuario(u)
          setEventos(evs)
          setInscripciones(ins)
        }
      } catch (e) {
        if (mounted) setError((e as Error).message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (email) load()
    return () => { mounted = false }
  }, [email, name, role])

  const estaInscrito = (idEvento: number) => inscripciones.some((i) => i.id_evento === idEvento && i.estado !== 'CANCELADO')

  const handleInscribir = async (idEvento: number) => {
    if (!usuario) return
    const ins = await inscribirse(token!, usuario.id_usuario, idEvento)
    if (ins) {
      setInscripciones((prev) => {
        const exists = prev.some((i) => i.id_evento === idEvento)
        if (exists) {
          return prev.map((i) => (i.id_evento === idEvento ? { ...i, estado: 'INSCRITO', id_inscripcion: ins.id_inscripcion } : i))
        }
        return [...prev, ins]
      })
      setQrEvento(idEvento)
      setTab('qr')
    }
  }

  const tieneAsistencia = (idEvento: number) => {
    const ins = inscripciones.find((i) => i.id_evento === idEvento)
    return !!ins?.asistencia && ins.asistencia.estado_validacion === 'VALIDADA'
  }

  const yaRespondioEncuesta = (idEvento: number) => {
    const ins = inscripciones.find((i) => i.id_evento === idEvento)
    return !!ins?.encuesta
  }

  const handleDesinscribir = async (idEvento: number) => {
    if (!usuario) return
    const ok = await desinscribirse(token!, usuario.id_usuario, idEvento)
    if (ok) {
      setInscripciones((prev) =>
        prev.map((i) => (i.id_evento === idEvento ? { ...i, estado: 'CANCELADO' } : i)),
      )
    }
  }

  const handleEnviarEncuesta = async (idEvento: number) => {
    const ins = inscripciones.find((i) => i.id_evento === idEvento)
    if (!ins) return
    const ok = await registrarEncuesta(token!, ins.id_inscripcion, calificacion, 'MUY_UTIL', comentarios)
    if (ok) {
      setInscripciones((prev) =>
        prev.map((i) =>
          i.id_evento === idEvento
            ? { ...i, encuesta: { calificacion, utilidad: 'MUY_UTIL', comentarios: comentarios || null } }
            : i,
        ),
      )
      setEncuestaEvento(null)
      setComentarios('')
      setCalificacion(4)
    }
  }
  const TABS = [
    { id: 'info' as const, label: 'Mi información' },
    { id: 'eventos' as const, label: 'Eventos' },
    { id: 'qr' as const, label: 'Mi pase QR' },
  ]

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
          {loading && <p className="text-zinc-500 text-sm">Cargando...</p>}
          {error && <p className="text-red-500 text-sm">Error al cargar datos: {error}</p>}

          {!loading && tab === 'info' && (
            <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <div><span className="text-zinc-500">Nombre:</span> {name}</div>
              <div><span className="text-zinc-500">Correo:</span> {usuario?.correo ?? email}</div>
              <div><span className="text-zinc-500">Estado:</span> {usuario?.estado ?? '-'}</div>
            </div>
          )}

          {!loading && tab === 'eventos' && (
            <div className="space-y-3">
              {eventos.length === 0 && <p className="text-zinc-500 text-sm">No hay eventos disponibles.</p>}
              {(encuestaEvento ? eventos.filter((e) => e.id_evento === encuestaEvento) : eventos).map((e) => (
                <div key={e.id_evento} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.nombre}</div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(e.fecha_inicio).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {e.recinto ?? 'Sin sala'}
                      </div>
                      <div className={`text-xs mt-1 ${estaInscrito(e.id_evento) ? 'text-green-600' : 'text-amber-600'}`}>
                        {estaInscrito(e.id_evento) ? 'Inscrito' : 'No inscrito'}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!estaInscrito(e.id_evento) && (
                        <button
                          onClick={() => handleInscribir(e.id_evento)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                        >
                          Inscribirme
                        </button>
                      )}
                      {estaInscrito(e.id_evento) && !tieneAsistencia(e.id_evento) && (
                        <>
                          <button
                            onClick={() => handleDesinscribir(e.id_evento)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            Desuscribirme
                          </button>
                          <button
                            onClick={() => { setQrEvento(e.id_evento); setTab('qr') }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-sm"
                          >
                            Mostrar QR
                          </button>
                        </>
                      )}
                      {estaInscrito(e.id_evento) && tieneAsistencia(e.id_evento) && (
                        <div className="w-full mt-2 space-y-2">
                          {yaRespondioEncuesta(e.id_evento) ? (
                            <p className="text-sm text-green-600">Encuesta enviada: {inscripciones.find((i) => i.id_evento === e.id_evento)?.encuesta?.calificacion}/4 ⭐</p>
                          ) : (
                            <>
                              <button
                                onClick={() => setEncuestaEvento(encuestaEvento === e.id_evento ? null : e.id_evento)}
                                className={`px-3 py-1.5 rounded-lg text-white text-sm ${encuestaEvento === e.id_evento ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                              >
                                {encuestaEvento === e.id_evento ? 'Cerrar encuesta' : 'Encuesta'}
                              </button>
                              {encuestaEvento === e.id_evento && (
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-3 mt-2">
                                  <div>
                                    <label className="text-sm text-zinc-500">Satisfacción (1 = pésimo, 4 = excelente)</label>
                                    <div className="flex gap-2 mt-1">
                                      {[1, 2, 3, 4].map((n) => (
                                        <button
                                          key={n}
                                          onClick={() => setCalificacion(n)}
                                          className={`w-10 h-10 rounded-lg text-sm font-medium ${calificacion === n ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'}`}
                                        >
                                          {n}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <textarea
                                    value={comentarios}
                                    onChange={(ev) => setComentarios(ev.target.value)}
                                    placeholder="Comentarios (opcional)"
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-50 text-sm"
                                  />
                                  <button
                                    onClick={() => handleEnviarEncuesta(e.id_evento)}
                                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                                  >
                                    Enviar encuesta
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tab === 'qr' && (
            <div className="space-y-4">
              {(() => {
                const inscritos = inscripciones.filter((i) => i.estado !== 'CANCELADO')
                if (inscritos.length === 0) {
                  return <p className="text-zinc-500 text-sm">No tienes inscripciones activas. Inscríbete en un evento.</p>
                }
                const mostrar = qrEvento ? inscritos.filter((i) => i.id_evento === qrEvento) : inscritos
                const lista = mostrar.length ? mostrar : inscritos
                return lista.map((ins) => {
                  const ev = eventos.find((e) => e.id_evento === ins.id_evento)
                  return (
                    <div key={ins.id_inscripcion} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
                      <p className="text-zinc-900 dark:text-zinc-50 font-medium mb-1">{ev?.nombre ?? `Evento #${ins.id_evento}`}</p>
                      <p className="text-xs text-zinc-500 mb-4">{ev ? new Date(ev.fecha_inicio).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''} · {ev?.recinto ?? ''}</p>
                      {usuario ? (
                        <div className="mx-auto inline-block p-3 bg-white rounded-lg">
                          <QRCodeSVG value={`syncpass:asistencia:${usuario.id_usuario}:${ins.id_evento}`} size={160} level="M" />
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-sm">Cargando usuario...</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-3">Muestra este código al ingresar al evento.</p>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
