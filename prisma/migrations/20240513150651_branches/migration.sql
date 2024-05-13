/*
  Warnings:

  - You are about to drop the column `title` on the `Branch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "title",
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ALTER COLUMN "gitBranch" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");
