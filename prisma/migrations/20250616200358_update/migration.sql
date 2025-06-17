/*
  Warnings:

  - The `bookedSlots` column on the `HaliSaha` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "HaliSaha" DROP COLUMN "bookedSlots",
ADD COLUMN     "bookedSlots" TIMESTAMP(3)[];
