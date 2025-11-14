-- Добавляем колонку updatedAt в таблицу Shop3DProductPlastic
ALTER TABLE "Shop3DProductPlastic"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;