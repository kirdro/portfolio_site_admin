-- Добавляем колонку material в таблицу Shop3DPlastic
ALTER TABLE "Shop3DPlastic"
ADD COLUMN IF NOT EXISTS "material" TEXT DEFAULT 'PLA';