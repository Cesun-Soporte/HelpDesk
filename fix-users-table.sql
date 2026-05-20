-- Script para permitir NULL en la columna name de la tabla users
-- Ejecutar en Neon PostgreSQL

ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- Verificar que el cambio fue aplicado
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'name';
