import { useEffect, useRef, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { useRole } from '../../hooks/useRole'
import { decodeJwt } from '../../utils/jwt'
import { Html5Qrcode } from 'html5-qrcode'
import {
  getEventos, getInscripcionesByEvento, registrarAsistencia, getMetricasEvento, getOrCreateUsuario,
  type Evento, type MetricasEvento, type Inscripcion,
} from '../../lib/syncpassApi'

type View = 'eventos' | 'scanner' | 'inscritos'

export function VoluntarioPanel() {
  const auth = useAuth()
  const role = useRole()
  const idClaims = decodeJwt(auth.user?.id_token)
  const accessClaims = decodeJwt(auth.user?.access_token)
  const name = idClaims?.['given_name'] || idClaims?.['name'] || idClaims?.['preferred_username'] || 'Voluntario'
  const email = idClaims?.['email'] || accessClaims?.['email'] || auth.user?.profile?.email || ''
  const token = auth.user?.access_token

  const [view, setView] = useState<View>('eventos')
  const [eventos, setEventos] = useState<Evento[]>([])
  const [metricas, setMetricas] = useState<Record<number, MetricasEvento>>({})
  const [selectedEvento, setSelectedEvento] = useState<number | null>(null)
  const [inscritos, setInscritos] = useState<Inscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [scanResult, setScanResult] = useState<string>('')
  const [scanStatus, setScanStatus] = useState<string>('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scannerDivId = 'qr-reader-vol'

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) { setLoading(false); return }
      await getOrCreateUsuario(token, email, name, role)
      const evs = await getEventos(token)
      const m: Record<number, MetricasEvento> = {}
      await Promise.all(evs.map(async (e) => {
        m[e.id_evento] = await getMetricasEvento(token, e.id_evento)
      }))
      if (mounted) {
        setEventos(evs)
        setMetricas(m)
        setLoading(false)
      }
    }
    if (email && token) load()
    return () => { mounted = false }
  }, [email, name, role, token])

  useEffect(() => {
    if (view !== 'inscritos' || !selectedEvento || !token) return
    getInscripcionesByEvento(token, selectedEvento).then(setInscritos)
  }, [view, selectedEvento, token])

  useEffect(() => {
    if (view !== 'scanner') {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
        scannerRef.current = null
      }
      return
    }
    const scanner = new Html5Qrcode(scannerDivId)
    scannerRef.current = scanner
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decoded) => {
        setScanResult(decoded)
        const parts = decoded.split(':')
        if (parts.length === 4 && parts[0] === 'syncpass' && parts[1] === 'asistencia') {
          const idUsuario = Number(parts[2])
          const idEvento = Number(parts[3])
          if (selectedEvento && idEvento !== selectedEvento) {
            setScanStatus('❌ El QR no corresponde a este evento')
            return
          }
          const ins = inscritos.find((i) => i.id_usuario === idUsuario)
            || (await (async () => {
              const list = await getInscripcionesByEvento(token!, idEvento)
              return list.find((i) => i.id_usuario === idUsuario)
            })())
          if (ins) {
            const res = await registrarAsistencia(token!, ins.id_inscripcion)
            const yaRegistrada = !res.ok && (res.error ?? '').toLowerCase().includes('duplicate')
            if (res.ok || yaRegistrada) {
              setScanSuccess(true)
              setScanStatus(`✅ Asistencia confirmada\nBeneficiario: ${ins.usuario?.nombre_mostrar ?? '-'}\nCorreo: ${ins.usuario?.correo ?? '-'}\nEstado: ${ins.estado}`)
              if (selectedEvento) {
                getInscripcionesByEvento(token!, selectedEvento).then(setInscritos)
                getMetricasEvento(token!, selectedEvento).then((m) => setMetricas((prev) => ({ ...prev, [selectedEvento]: m })))
              }
              if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {})
                scannerRef.current = null
              }
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
              timeoutRef.current = setTimeout(() => {
                setScanSuccess(false)
                setScanStatus('')
                setScanResult('')
                setView('eventos')
              }, 6000)
            } else {
              setScanStatus(`❌ ${res.error ?? 'Error al registrar'}`)
            }
          } else {
            setScanStatus('❌ No está en la lista de inscritos')
          }
        } else {
          setScanStatus('❌ QR no válido')
        }
      },
      () => {},
    ).catch((err) => setScanStatus(`Error cámara: ${err}`))

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {})
        scannerRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [view])

  const selectedEv = eventos.find((e) => e.id_evento === selectedEvento)

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Panel Voluntario</h2>
          <p className="text-xs text-zinc-500 mt-1">Eventos, scanner de asistencia y lista de inscritos.</p>
        </div>

        {view === 'eventos' && (
          <div className="px-6 py-5 space-y-3">
            {loading && <p className="text-zinc-500 text-sm">Cargando...</p>}
            {!loading && eventos.length === 0 && <p className="text-zinc-500 text-sm">No hay eventos.</p>}
            {eventos.map((e) => {
              const m = metricas[e.id_evento]
              return (
                <div key={e.id_evento} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{e.nombre}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(e.fecha_inicio).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {e.recinto ?? 'Sin sala'} · Cupos: {e.cupos_maximos}
                  </div>
                  {m && (
                    <div className="mt-2 flex gap-4 text-sm">
                      <div className="text-slate-900 dark:text-slate-100">Asistentes: <span className="font-semibold text-green-600">{m.totalAsistencias}</span></div>
                      <div className="text-slate-900 dark:text-slate-100">Faltantes: <span className="font-semibold text-amber-600">{m.totalInscritos - m.totalAsistencias}</span></div>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { setSelectedEvento(e.id_evento); setView('inscritos') }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Lista de inscritos
                    </button>
                    <button
                      onClick={() => { setSelectedEvento(e.id_evento); setView('scanner') }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      Escanear QR
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {view === 'scanner' && selectedEv && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Escanear QR — {selectedEv.nombre}</h3>
              <button onClick={() => setView('eventos')} className="text-sm text-zinc-500 hover:text-zinc-700">← Volver</button>
            </div>
            {!scanSuccess && <div id={scannerDivId} className="w-full max-w-sm mx-auto" />}
            {!scanSuccess && scanResult && <p className="text-xs text-zinc-500 break-all">Último: {scanResult}</p>}
            {scanSuccess && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <span className="text-3xl text-green-600">✓</span>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-4 text-slate-900 whitespace-pre-line text-sm font-medium text-center shadow-lg">
                  {scanStatus}
                </div>
                <p className="text-xs text-zinc-400 mt-4">Volviendo a la lista en 6 segundos...</p>
              </div>
            )}
            {!scanSuccess && scanStatus && (
              <div className="bg-white rounded-xl border border-zinc-200 p-4 text-slate-900 whitespace-pre-line text-sm font-medium">
                {scanStatus}
              </div>
            )}
          </div>
        )}

        {view === 'inscritos' && selectedEv && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Inscritos — {selectedEv.nombre}</h3>
              <button onClick={() => setView('eventos')} className="text-sm text-zinc-500 hover:text-zinc-700">← Volver</button>
            </div>
            <button
              onClick={() => getInscripcionesByEvento(token!, selectedEv.id_evento).then(setInscritos)}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-sm"
            >
              Actualizar
            </button>
            <div className="space-y-2">
              {inscritos.length === 0 && <p className="text-zinc-500 text-sm">Sin inscritos.</p>}
              {inscritos.map((i) => {
                const asistio = !!i.asistencia && i.asistencia.estado_validacion === 'VALIDADA'
                return (
                  <div key={i.id_inscripcion} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{i.usuario?.nombre_mostrar ?? '-'}</div>
                      <div className="text-xs text-zinc-500">{i.usuario?.correo ?? '-'} · {i.estado}</div>
                    </div>
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (asistio ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}>
                      {asistio ? "Presente" : "Pendiente"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}