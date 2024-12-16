-- DropForeignKey
ALTER TABLE `PermissionRoles` DROP FOREIGN KEY `PermissionRoles_permissionId_fkey`;

-- DropForeignKey
ALTER TABLE `PermissionRoles` DROP FOREIGN KEY `PermissionRoles_roleId_fkey`;

-- AddForeignKey
ALTER TABLE `PermissionRoles` ADD CONSTRAINT `PermissionRoles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionRoles` ADD CONSTRAINT `PermissionRoles_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
