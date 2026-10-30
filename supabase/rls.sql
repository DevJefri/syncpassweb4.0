-- ==========================================
-- FASE 6: Row Level Security (RLS)
-- Ejecutar en Supabase → SQL Editor
-- ==========================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidad_vecinal ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_tematica ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuesta ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para service_role (acceso completo, bypass RLS por defecto en Supabase)
-- Supabase ya permite al service_role bypass RLS, pero las hacemos explícitas.

-- service_role: acceso total a todas las tablas
CREATE POLICY "service_role_all_rol" ON rol FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_usuario" ON usuario FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_unidad_vecinal" ON unidad_vecinal FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_area_tematica" ON area_tematica FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_proyecto" ON proyecto FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_evento" ON evento FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_inscripcion" ON inscripcion FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_asistencia" ON asistencia FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_encuesta" ON encuesta FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Políticas para anon (solo lectura de eventos y proyectos públicos, si se desea)
-- Descomenta si quieres que el frontend (anon) pueda leer eventos sin backend:
-- CREATE POLICY "anon_read_evento" ON evento FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon_read_proyecto" ON proyecto FOR SELECT TO anon USING (true);

-- 4. Políticas para authenticated (usuarios autenticados via Supabase Auth)
-- Como usamos Cognito (no Supabase Auth), no hay usuarios 'authenticated' en Supabase.
-- Todo el acceso va por el backend (postgres/service_role).

-- 5. Verificar RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';