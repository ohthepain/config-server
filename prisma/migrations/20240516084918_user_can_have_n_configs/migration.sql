/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Config` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Config_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Config_id_key" ON "Config"("id");

-- AddForeignKey
ALTER TABLE "Config" ADD CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
