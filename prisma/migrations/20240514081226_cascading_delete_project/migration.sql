-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
