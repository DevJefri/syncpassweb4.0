-- Limpia todas las tablas (en orden inverso de dependencias) y recrea desde cero.
-- 1) Ejecuta este archivo primero.
-- 2) Luego ejecuta schema.sql (DDL + seed).

DROP TABLE IF EXISTS encuesta CASCADE;
DROP TABLE IF EXISTS asistencia CASCADE;
DROP TABLE IF EXISTS inscripcion CASCADE;
DROP TABLE IF EXISTS evento CASCADE;
DROP TABLE IF EXISTS proyecto CASCADE;
DROP TABLE IF EXISTS area_tematica CASCADE;
DROP TABLE IF EXISTS unidad_vecinal CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS rol CASCADE;