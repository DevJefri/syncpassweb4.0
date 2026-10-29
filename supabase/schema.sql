-- ==========================================
-- BASE DE DATOS: SYNCPASS (Supabase/PostgreSQL)
-- ==========================================

-- (pega aquí el DDL que ya tienes: rol, usuario, unidad_vecinal, area_tematica,
-- proyecto, evento, inscripcion, asistencia, encuesta + índices)

-- =========================
-- SEED: roles (debe coincidir con grupos de Cognito)
-- =========================
INSERT INTO rol (nombre, descripcion) VALUES
  ('Administrador', 'Administra el sistema completo'),
  ('Docente', 'Crea y coordina proyectos y supervisa actividades'),
  ('Voluntario', 'Recibe a los asistentes por lista pre-establecida'),
  ('Beneficiario', 'Participa en actividades y responde encuestas')
ON CONFLICT (nombre) DO NOTHING;

-- =========================
-- SEED: datos de ejemplo para probar el flujo Beneficiario
-- =========================
INSERT INTO unidad_vecinal (nombre, direccion_referencial) VALUES
  ('Unidad 1', 'Av. Principal 123') ON CONFLICT DO NOTHING;

INSERT INTO area_tematica (nombre, descripcion) VALUES
  ('Medio ambiente', 'Proyectos ambientales') ON CONFLICT (nombre) DO NOTHING;

-- Coordinador de ejemplo (rol administrador). El correo debe coincidir con un usuario Cognito real para login.
INSERT INTO usuario (id_rol, nombre_usuario, nombre_mostrar, correo, estado)
SELECT r.id_rol, 'admin', 'Administrador', 'admin@example.com', 'ACTIVO'
FROM rol r WHERE r.nombre = 'administrador'
ON CONFLICT (nombre_usuario) DO NOTHING;

INSERT INTO proyecto (id_coordinador, id_unidad, id_area, titulo, descripcion, fecha_inicio, fecha_termino, estado)
SELECT u.id_usuario, 1, 1, 'Proyecto Reciclaje', 'Recolección y reciclaje comunitario', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'EN_CURSO'
FROM usuario u WHERE u.nombre_usuario = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO evento (id_proyecto, nombre, descripcion, fecha_inicio, fecha_termino, cupos_maximos, recinto, direccion, estado)
SELECT p.id_proyecto, 'Taller de reciclaje', 'Taller práctico', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 25, 'Sala A', 'Av. Principal 123', 'PROGRAMADO'
FROM proyecto p WHERE p.titulo = 'Proyecto Reciclaje'
ON CONFLICT DO NOTHING;

INSERT INTO evento (id_proyecto, nombre, descripcion, fecha_inicio, fecha_termino, cupos_maximos, recinto, direccion, estado)
SELECT p.id_proyecto, 'Charla ambiental', 'Charla informativa', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 1 hour', 40, 'Sala B', 'Av. Principal 123', 'PROGRAMADO'
FROM proyecto p WHERE p.titulo = 'Proyecto Reciclaje'
ON CONFLICT DO NOTHING;