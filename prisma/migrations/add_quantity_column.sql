-- Добавляем колонку quantity в таблицу Shop3DProductPlastic
ALTER TABLE "Shop3DProductPlastic"
ADD COLUMN IF NOT EXISTS "quantity" DOUBLE PRECISION;