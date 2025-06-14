-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HaliSaha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "startHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "hasShowers" BOOLEAN NOT NULL DEFAULT false,
    "hasShoeRental" BOOLEAN NOT NULL DEFAULT false,
    "hasCafeteria" BOOLEAN NOT NULL DEFAULT false,
    "hasNightLighting" BOOLEAN NOT NULL DEFAULT false,
    "imagesUrl" TEXT[],
    "bookedSlots" TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HaliSaha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "haliSahaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reservationDateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdatedById" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionId" TEXT,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HaliSaha" ADD CONSTRAINT "HaliSaha_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_haliSahaId_fkey" FOREIGN KEY ("haliSahaId") REFERENCES "HaliSaha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_lastUpdatedById_fkey" FOREIGN KEY ("lastUpdatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
