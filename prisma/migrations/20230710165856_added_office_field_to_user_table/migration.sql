-- AlterTable
ALTER TABLE `User` ADD COLUMN `officeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `OfficeLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
