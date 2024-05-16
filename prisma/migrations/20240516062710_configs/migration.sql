/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Config` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Config` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ConfigStatus" AS ENUM ('CREATED', 'WAITING', 'BUILDING', 'DONE');

-- DropForeignKey
ALTER TABLE "Config" DROP CONSTRAINT "Config_branchId_fkey";

-- AlterTable
ALTER TABLE "Config" DROP CONSTRAINT "Config_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ConfigStatus" NOT NULL DEFAULT 'CREATED',
ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "downloadUrl" DROP NOT NULL,
ALTER COLUMN "checksumMd5" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
