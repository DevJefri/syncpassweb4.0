import { apiFetch } from './api'

// ---- Tipos alineados al backend ----
export type Rol = { id_rol: number; nombre: string; descripcion: string | null }
export type Usuario = {
  id_usuario: number
  id_rol: number
  rol?: { id_rol: number; nombre: string; descripcion: string | null } | null
  rol_nombre?: string
  nombre_usuario: string
  nombre_mostrar: string
  correo: string
  estado: string
  fecha_creacion?: string
}
export type UnidadVecinal = { id_unidad: number; nombre: string; direccion_referencial: string | null; latitud: number | null; longitud: number | null }
export type AreaTematica = { id_area: number; nombre: string; descripcion: string | null }
export type Proyecto = {
  id_proyecto: number
  id_coordinador: number
  coordinador?: Usuario
  id_unidad: number
  unidad?: UnidadVecinal
  id_area: number
  area?: AreaTematica
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_termino: string
  estado: string
}
export type Evento = {
  id_evento: number
  id_proyecto: number
  proyecto?: Proyecto
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
}
export type Inscripcion = {
  id_inscripcion: number
  id_usuario: number
  usuario?: Usuario
  id_evento: number
  evento?: Evento
  fecha_inscripcion: string
  estado: string
  asistencia?: { estado_validacion: string } | null
  encuesta?: { calificacion: number; utilidad: string; comentarios: string | null } | null
}
export type Asistencia = {
  id_asistencia: number
  id_inscripcion: number
  fecha_marcacion: string
  latitud: number | null
  longitud: number | null
  estado_validacion: string
  estado_sincronizacion: string
}
export type Encuesta = {
  id_encuesta: number
  id_inscripcion: number
  calificacion: number
  utilidad: string
  comentarios: string | null
  fecha_respuesta: string
  estado_sincronizacion: string
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

// ---- Usuarios ----
export async function getOrCreateUsuario(token: string, email: string, nombre: string, cognitoRole?: string): Promise<Usuario | null> {
  try {
    const u = await apiFetch<Usuario>(`/supabase/usuarios/correo/${encodeURIComponent(email)}`, token)
    return u
  } catch {
    // no existe, crear
    const roleMap: Record<string, string> = {
      Administrador: 'Administrador', administrador: 'Administrador', admin: 'Administrador',
      Docente: 'Docente', docente: 'Docente',
      Voluntario: 'Voluntario', voluntario: 'Voluntario', colaborador: 'Voluntario',
      Beneficiario: 'Beneficiario', beneficiario: 'Beneficiario', cliente: 'Beneficiario',
    }
    const bdRole = roleMap[cognitoRole ?? ''] ?? 'Beneficiario'
    const created = await apiFetch<Usuario>('/supabase/usuarios/me', token, {
      method: 'POST',
      body: JSON.stringify({ email, nombreMostrar: nombre }),
    })
    // si el rol no coincide, actualizar
    if (created && created.rol?.nombre !== bdRole) {
      const roles = await apiFetch<Rol[]>('/supabase/roles', token).catch(() => [] as Rol[])
      const rol = roles.find((r) => r.nombre === bdRole)
      if (rol) {
        await apiFetch<Usuario>(`/supabase/usuarios/${created.id_usuario}`, token, {
          method: 'PUT',
          body: JSON.stringify({ id_rol: rol.id_rol, rol: { id_rol: rol.id_rol, nombre: rol.nombre } }),
        }).catch(() => null)
      }
    }
    return created
  }
}

export async function getUsuarios(token: string): Promise<Usuario[]> {
  return apiFetch<Usuario[]>('/supabase/usuarios', token)
}

export async function createUsuario(token: string, u: Partial<Usuario>): Promise<Usuario | null> {
  return apiFetch<Usuario>('/supabase/usuarios', token, { method: 'POST', body: JSON.stringify(u) })
}

export async function updateUsuario(token: string, id: number, u: Partial<Usuario>): Promise<Usuario | null> {
  return apiFetch<Usuario>(`/supabase/usuarios/${id}`, token, { method: 'PUT', body: JSON.stringify(u) })
}

export async function deleteUsuario(token: string, id: number): Promise<boolean> {
  try { await apiFetch(`/supabase/usuarios/${id}`, token, { method: 'DELETE' }); return true } catch { return false }
}

// ---- Roles ----
export async function getRoles(token: string): Promise<Rol[]> {
  return apiFetch<Rol[]>('/supabase/roles', token).catch(() => [])
}

// ---- Proyectos ----
export async function getProyectos(token: string): Promise<Proyecto[]> {
  return apiFetch<Proyecto[]>('/supabase/proyectos', token)
}

export async function getProyectosByCoordinador(token: string, idUsuario: number): Promise<Proyecto[]> {
  return apiFetch<Proyecto[]>(`/supabase/proyectos/coordinador/${idUsuario}`, token)
}

export async function createProyecto(token: string, p: Partial<Proyecto>, idCoordinador: number): Promise<Proyecto | null> {
  return apiFetch<Proyecto>(`/supabase/proyectos?idCoordinador=${idCoordinador}`, token, { method: 'POST', body: JSON.stringify(p) })
}

export async function updateProyecto(token: string, id: number, p: Partial<Proyecto>): Promise<Proyecto | null> {
  return apiFetch<Proyecto>(`/supabase/proyectos/${id}`, token, { method: 'PUT', body: JSON.stringify(p) })
}

export async function deleteProyecto(token: string, id: number): Promise<boolean> {
  try { await apiFetch(`/supabase/proyectos/${id}`, token, { method: 'DELETE' }); return true } catch { return false }
}

// ---- Eventos ----
export async function getEventos(token: string): Promise<Evento[]> {
  return apiFetch<Evento[]>('/supabase/eventos', token)
}

export async function getEventosByProyecto(token: string, idProyecto: number): Promise<Evento[]> {
  return apiFetch<Evento[]>(`/supabase/eventos/proyecto/${idProyecto}`, token)
}

export async function createEvento(token: string, e: Partial<Evento>): Promise<Evento | null> {
  const body = { ...e }
  if (body.fecha_inicio && !body.fecha_inicio.includes(':00', 16)) body.fecha_inicio = body.fecha_inicio + ':00'
  if (body.fecha_termino && !body.fecha_termino.includes(':00', 16)) body.fecha_termino = body.fecha_termino + ':00'
  return apiFetch<Evento>('/supabase/eventos', token, { method: 'POST', body: JSON.stringify(body) })
}

export async function updateEvento(token: string, id: number, e: Partial<Evento>): Promise<Evento | null> {
  const body = { ...e }
  if (body.fecha_inicio && !body.fecha_inicio.includes(':00', 16)) body.fecha_inicio = body.fecha_inicio + ':00'
  if (body.fecha_termino && !body.fecha_termino.includes(':00', 16)) body.fecha_termino = body.fecha_termino + ':00'
  return apiFetch<Evento>(`/supabase/eventos/${id}`, token, { method: 'PUT', body: JSON.stringify(body) })
}

export async function deleteEvento(token: string, id: number): Promise<boolean> {
  try { await apiFetch(`/supabase/eventos/${id}`, token, { method: 'DELETE' }); return true } catch { return false }
}

// ---- Inscripciones ----
export async function getInscripcionesByUsuario(token: string, idUsuario: number): Promise<Inscripcion[]> {
  return apiFetch<Inscripcion[]>(`/supabase/inscripciones/usuario/${idUsuario}`, token)
}

export async function getInscripcionesByEvento(token: string, idEvento: number): Promise<Inscripcion[]> {
  return apiFetch<Inscripcion[]>(`/supabase/inscripciones/evento/${idEvento}`, token)
}

export async function inscribirse(token: string, idUsuario: number, idEvento: number): Promise<Inscripcion | null> {
  return apiFetch<Inscripcion>('/supabase/inscripciones', token, {
    method: 'POST',
    body: JSON.stringify({ idUsuario, idEvento }),
  })
}

export async function desinscribirse(token: string, idUsuario: number, idEvento: number): Promise<boolean> {
  try { await apiFetch(`/supabase/inscripciones/${idUsuario}/${idEvento}`, token, { method: 'DELETE' }); return true } catch { return false }
}

// ---- Asistencias ----
export async function getAsistenciasByEvento(token: string, idEvento: number): Promise<Asistencia[]> {
  return apiFetch<Asistencia[]>(`/supabase/asistencias/evento/${idEvento}`, token)
}

export async function registrarAsistencia(token: string, idInscripcion: number, lat?: number, lng?: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch('/supabase/asistencias', token, {
      method: 'POST',
      body: JSON.stringify({ idInscripcion, latitud: lat ?? null, longitud: lng ?? null }),
    })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// ---- Encuestas ----
export async function getEncuestasByEvento(token: string, idEvento: number): Promise<Encuesta[]> {
  return apiFetch<Encuesta[]>(`/supabase/encuestas/evento/${idEvento}`, token)
}

export async function registrarEncuesta(token: string, idInscripcion: number, calificacion: number, utilidad: string = 'MUY_UTIL', comentarios?: string): Promise<boolean> {
  try {
    await apiFetch('/supabase/encuestas', token, {
      method: 'POST',
      body: JSON.stringify({ idInscripcion, calificacion, utilidad, comentarios: comentarios || null }),
    })
    return true
  } catch { return false }
}

// ---- Metricas (calculadas en frontend) ----
export async function getMetricasEvento(token: string, idEvento: number): Promise<MetricasEvento> {
  const inscripciones = await getInscripcionesByEvento(token, idEvento)
  const totalInscritos = inscripciones.length
  const asistencias = await getAsistenciasByEvento(token, idEvento)
  const totalAsistencias = asistencias.filter((a) => a.estado_validacion === 'VALIDADA').length
  const encuestas = await getEncuestasByEvento(token, idEvento)
  const encuestasRespondidas = encuestas.length
  const suma = encuestas.reduce((a, e) => a + (e.calificacion ?? 0), 0)
  const comentarios = encuestas.map((e) => e.comentarios).filter(Boolean) as string[]
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