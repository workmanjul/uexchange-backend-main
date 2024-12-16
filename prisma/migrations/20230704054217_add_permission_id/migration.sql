/*
  Warnings:

  - The primary key for the `UserPermissions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `UserPermissions` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`userId`, `permissionId`);
