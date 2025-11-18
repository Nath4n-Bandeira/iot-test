-- CreateTable
CREATE TABLE "Amizade" (
    "id" TEXT NOT NULL,
    "usuario1Id" VARCHAR(36) NOT NULL,
    "usuario2Id" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amizade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Amizade_usuario1Id_idx" ON "Amizade"("usuario1Id");

-- CreateIndex
CREATE INDEX "Amizade_usuario2Id_idx" ON "Amizade"("usuario2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Amizade_usuario1Id_usuario2Id_key" ON "Amizade"("usuario1Id", "usuario2Id");

-- AddForeignKey
ALTER TABLE "Amizade" ADD CONSTRAINT "Amizade_usuario1Id_fkey" FOREIGN KEY ("usuario1Id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amizade" ADD CONSTRAINT "Amizade_usuario2Id_fkey" FOREIGN KEY ("usuario2Id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
