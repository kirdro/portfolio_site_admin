-- Create Shop3DService table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DService" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceFrom" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Create Shop3DCategory table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DCategory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Create Shop3DTag table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DTag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Create unique index on Shop3DTag.name if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Shop3DTag_name_key" ON "Shop3DTag"("name");

-- Create Shop3DPlastic table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DPlastic" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT,
    "properties" JSONB,
    "pricePerGram" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Create Shop3DProduct table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DProduct" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "characteristics" JSONB,
    "productionTime" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    CONSTRAINT "Shop3DProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Shop3DCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create index on Shop3DProduct.isFeatured and createdAt if not exists
CREATE INDEX IF NOT EXISTS "Shop3DProduct_isFeatured_createdAt_idx" ON "Shop3DProduct"("isFeatured", "createdAt");

-- Create Shop3DProductPlastic join table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DProductPlastic" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL,
    "plasticId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id"),
    CONSTRAINT "Shop3DProductPlastic_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Shop3DProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Shop3DProductPlastic_plasticId_fkey" FOREIGN KEY ("plasticId") REFERENCES "Shop3DPlastic"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on Shop3DProductPlastic if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Shop3DProductPlastic_productId_plasticId_key" ON "Shop3DProductPlastic"("productId", "plasticId");

-- Create Shop3DContact table if not exists
CREATE TABLE IF NOT EXISTS "Shop3DContact" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Create index on Shop3DContact.order and createdAt if not exists
CREATE INDEX IF NOT EXISTS "Shop3DContact_order_createdAt_idx" ON "Shop3DContact"("order", "createdAt");

-- Create many-to-many relation table for Shop3DProduct and Shop3DTag if not exists
CREATE TABLE IF NOT EXISTS "_Shop3DProductToShop3DTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Shop3DProductToShop3DTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Shop3DProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Shop3DProductToShop3DTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Shop3DTag"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique index on _Shop3DProductToShop3DTag if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "_Shop3DProductToShop3DTag_AB_unique" ON "_Shop3DProductToShop3DTag"("A", "B");
CREATE INDEX IF NOT EXISTS "_Shop3DProductToShop3DTag_B_index" ON "_Shop3DProductToShop3DTag"("B");