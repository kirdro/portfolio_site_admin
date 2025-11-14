-- Добавляем недостающие колонки в таблицу Shop3DTag
ALTER TABLE "Shop3DTag"
ADD COLUMN IF NOT EXISTS "description" TEXT;