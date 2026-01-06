-- CreateTable
CREATE TABLE "Raffle" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "entriesCount" INTEGER NOT NULL DEFAULT 0,
    "maxEntries" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaffleEntry" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raffleId" TEXT NOT NULL DEFAULT 'main',

    CONSTRAINT "RaffleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaffleEntry_txHash_key" ON "RaffleEntry"("txHash");

-- CreateIndex
CREATE INDEX "RaffleEntry_address_idx" ON "RaffleEntry"("address");

-- CreateIndex
CREATE UNIQUE INDEX "RaffleEntry_address_raffleId_key" ON "RaffleEntry"("address", "raffleId");

-- AddForeignKey
ALTER TABLE "RaffleEntry" ADD CONSTRAINT "RaffleEntry_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
