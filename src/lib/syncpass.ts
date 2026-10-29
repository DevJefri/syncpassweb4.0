import { supabase } from './supabase'

export type Evento = {
  id_evento: number
  id_proyecto: number
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_termino: string
  cupos_maximos: number
  recinto: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
  radio_validacion_metros: number
  estado: string
  proyecto?: { titulo: string } | null
}

export type Inscripcion = {
  id_inscripcion: number
  id_usuario: number
  id_evento: number
  estado: string
  fecha_inscripcion: string
  asistencia?: { estado_validacion: string } | null
  encuesta?: { calificacion: number; utilidad: string; comentarios: string | null } | null
}

export type Usuario = {
  id_usuario: number
  id_rol: number
  nombre_usuario: string
  nombre_mostrar: string
  correo: string
  estado: string
}

export type Proyecto = {
  id_proyecto: number
  id_coordinador: number
  id_unidad: number
  id_area: number
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_termino: string
  estado: string
}

export type MetricasEvento = {
  totalInscritos: number
  totalAsistencias: number
  porcentajeAsistencia: number
  encuestasRespondidas: number
  porcentajeEncuestas: number
  satisfaccionPromedio: number
  comentarios: string[]
}

export async function getOrCreateUsuario(email: string, nombre: string, cognitoRole?: string): Promise<Usuario | null> {
  if (!supabase) return null
  const { data: found, error: findErr } = await supabase
    .from('usuario')
    .select('*')
    .eq('correo', email)
    .maybeSingle()
  if (findErr) {
    console.error('getOrCreateUsuario find:', findErr)
    return null
  }
  if (found) return found as Usuario

  const roleMap: Record<string, string> = {
    Administrador: 'Administrador',
    administrador: 'Administrador',
    Docente: 'Docente',
    docente: 'Docente',
    Voluntario: 'Voluntario',
    voluntario: 'Voluntario',
    colaborador: 'Voluntario',
    Beneficiario: 'Beneficiario',
    beneficiario: 'Beneficiario',
    cliente: 'Beneficiario',
  }
  const bdRoleName = roleMap[cognitoRole ?? ''] ?? 'Beneficiario'

  const { data: rol } = await supabase.from('rol').select('id_rol').eq('nombre', bdRoleName).maybeSingle()
  const idRol = rol?.id_rol ?? 1

  const { data: created, error: createErr } = await supabase
    .from('usuario')
    .insert({
      id_rol: idRol,
      nombre_usuario: email.split('@')[0] + '_' + Date.now().toString().slice(-4),
      nombre_mostrar: nombre || email,
      correo: email,
      estado: 'ACTIVO',
    })
    .select('*')
    .single()
  if (createErr) {
    console.error('getOrCreateUsuario create:', createErr)
    return null
  }
  return created as Usuario
}

export async function getEventos(): Promise<Evento[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('evento')
    .select('*, proyecto:proyecto(titulo)')
    .order('fecha_inicio', { ascending: true })
  if (error) {
    console.error('getEventos:', error)
    return []
  }
  return (data ?? []) as Evento[]
}

export async function getInscripciones(idUsuario: number): Promise<Inscripcion[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('inscripcion')
    .select('*, asistencia:asistencia(estado_validacion), encuesta:encuesta(calificacion, utilidad, comentarios)')
    .eq('id_usuario', idUsuario)
  if (error) {
    console.error('getInscripciones:', error)
    return []
  }
  return (data ?? []).map((row: any) => ({
    ...row,
    asistencia: Array.isArray(row.asistencia) ? row.asistencia[0] ?? null : row.asistencia ?? null,
    encuesta: Array.isArray(row.encuesta) ? row.encuesta[0] ?? null : row.encuesta ?? null,
  })) as Inscripcion[]
}

export async function inscribirse(idUsuario: number, idEvento: number): Promise<Inscripcion | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('inscripcion')
    .upsert({ id_usuario: idUsuario, id_evento: idEvento, estado: 'INSCRITO' }, { onConflict: 'id_usuario,id_evento' })
    .select('*')
    .single()
  if (error) {
    console.error('inscribirse:', error)
    return null
  }
  return data as Inscripcion
}

export async function desinscribirse(idUsuario: number, idEvento: number): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('inscripcion')
    .update({ estado: 'CANCELADO' })
    .eq('id_usuario', idUsuario)
    .eq('id_evento', idEvento)
  if (error) {
    console.error('desinscribirse:', error)
    return false
  }
  return true
}

export async function getProyectosByCoordinador(idUsuario: number): Promise<Proyecto[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .eq('id_coordinador', idUsuario)
    .order('fecha_inicio', { ascending: false })
  if (error) { console.error('getProyectosByCoordinador:', error); return [] }
  return (data ?? []) as Proyecto[]
}

export async function createProyecto(p: Omit<Proyecto, 'id_proyecto'>): Promise<Proyecto | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('proyecto').insert(p).select('*').single()
  if (error) { console.error('createProyecto:', error); return null }
  return data as Proyecto
}

export async function deleteProyecto(idProyecto: number): Promise<boolean> {
  if (!supabase) return false
  await supabase.from('evento').delete().eq('id_proyecto', idProyecto)
  const { error } = await supabase.from('proyecto').delete().eq('id_proyecto', idProyecto)
  if (error) { console.error('deleteProyecto:', error); return false }
  return true
}

export async function getEventosByProyecto(idProyecto: number): Promise<Evento[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('evento')
    .select('*')
    .eq('id_proyecto', idProyecto)
    .order('fecha_inicio', { ascending: true })
  if (error) { console.error('getEventosByProyecto:', error); return [] }
  return (data ?? []) as Evento[]
}

export async function createEvento(e: Omit<Evento, 'id_evento' | 'proyecto'>): Promise<Evento | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('evento').insert(e).select('*').single()
  if (error) { console.error('createEvento:', error); return null }
  return data as Evento
}

export async function updateProyecto(idProyecto: number, p: Partial<Omit<Proyecto, 'id_proyecto'>>): Promise<Proyecto | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('proyecto').update(p).eq('id_proyecto', idProyecto).select('*').single()
  if (error) { console.error('updateProyecto:', error); return null }
  return data as Proyecto
}

export async function updateEvento(idEvento: number, e: Partial<Omit<Evento, 'id_evento' | 'proyecto'>>): Promise<Evento | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('evento').update(e).eq('id_evento', idEvento).select('*').single()
  if (error) { console.error('updateEvento:', error); return null }
  return data as Evento
}
export async function deleteEvento(idEvento: number): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('evento').delete().eq('id_evento', idEvento)
  if (error) { console.error('deleteEvento:', error); return false }
  return true
}

export async function getInscritosByEvento(idEvento: number): Promise<{ id_inscripcion: number; id_usuario: number; id_evento: number; nombre: string; correo: string; estado: string; asistio: boolean }[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('inscripcion')
    .select('id_inscripcion, id_usuario, estado, usuario:usuario(nombre_mostrar, correo), asistencia:asistencia(estado_validacion)')
    .eq('id_evento', idEvento)
  if (error) { console.error('getInscritosByEvento:', error); return [] }
  return (data ?? []).map((row: any) => ({
    id_inscripcion: row.id_inscripcion,
    id_usuario: row.id_usuario,
    id_evento: idEvento,
    nombre: row.usuario?.nombre_mostrar ?? '-',
    correo: row.usuario?.correo ?? '-',
    estado: row.estado,
    asistio: Array.isArray(row.asistencia) ? row.asistencia.some((a: any) => a.estado_validacion === 'VALIDADA') : row.asistencia?.estado_validacion === 'VALIDADA',
  }))
}

export async function registrarAsistencia(idInscripcion: number, lat?: number, lng?: number): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase no configurado' }
  const { error } = await supabase.from('asistencia').insert({
    id_inscripcion: idInscripcion,
    fecha_marcacion: new Date().toISOString(),
    latitud: lat ?? null,
    longitud: lng ?? null,
    estado_validacion: 'VALIDADA',
    estado_sincronizacion: 'SINCRONIZADO',
    identificador_operacion: crypto.randomUUID(),
  })
  if (error) { console.error('registrarAsistencia:', error); return { ok: false, error: error.message } }
  return { ok: true }
}
export async function registrarEncuesta(idInscripcion: number, calificacion: number, utilidad: string = 'MUY_UTIL', comentarios?: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('encuesta').upsert({
    id_inscripcion: idInscripcion,
    calificacion,
    utilidad,
    comentarios: comentarios || null,
    identificador_operacion: crypto.randomUUID(),
  }, { onConflict: 'id_inscripcion' })
  if (error) { console.error('registrarEncuesta:', error); return false }
  return true
}
export async function getMetricasEvento(idEvento: number): Promise<MetricasEvento> {
  const empty: MetricasEvento = { totalInscritos: 0, totalAsistencias: 0, porcentajeAsistencia: 0, encuestasRespondidas: 0, porcentajeEncuestas: 0, satisfaccionPromedio: 0, comentarios: [] }
  if (!supabase) return empty
  const { data: ins } = await supabase.from('inscripcion').select('id_inscripcion').eq('id_evento', idEvento)
  const totalInscritos = ins?.length ?? 0
  const ids = (ins ?? []).map((i: any) => i.id_inscripcion)
  let totalAsistencias = 0
  if (ids.length) {
    const { data: asis } = await supabase.from('asistencia').select('id_asistencia').in('id_inscripcion', ids).eq('estado_validacion', 'VALIDADA')
    totalAsistencias = asis?.length ?? 0
  }
  let encuestasRespondidas = 0
  let suma = 0
  const comentarios: string[] = []
  if (ids.length) {
    const { data: enc } = await supabase.from('encuesta').select('calificacion, comentarios').in('id_inscripcion', ids)
    encuestasRespondidas = enc?.length ?? 0
    for (const e of enc ?? []) {
      suma += e.calificacion ?? 0
      if (e.comentarios) comentarios.push(e.comentarios)
    }
  }
  return {
    totalInscritos,
    totalAsistencias,
    porcentajeAsistencia: totalInscritos ? Math.round((totalAsistencias / totalInscritos) * 100) : 0,
    encuestasRespondidas,
    porcentajeEncuestas: totalInscritos ? Math.round((encuestasRespondidas / totalInscritos) * 100) : 0,
    satisfaccionPromedio: encuestasRespondidas ? +(suma / encuestasRespondidas).toFixed(2) : 0,
    comentarios,
  }
}