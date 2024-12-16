// prisma/seed/seeder1.ts

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import {
  CREATE_ROLE,
  DELETE_ROLE,
  EDIT_ROLE,
  MANAGE_EXCHANGE_RATES,
  READ_ROLE,
  TRADING,
  Create_On_Hold,
  Release_On_Hold,
  Create_WholeSale,
  View_Customer,
  Create_Inventory,
  Read_Inventory,
  Edit_Inventory,
} from "../src/Constants";

const prisma = new PrismaClient();

export async function permissionSeeder() {
  async function createPermission(permissionData) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: permissionData.name },
    });

    if (existingPermission) {
      console.log(`Permission '${permissionData.name}' already exists`);
    } else {
      await prisma.permission.create({ data: permissionData });
      console.log(`Permission '${permissionData.name}' created`);
    }
  }

  const permissions = [
    { name: CREATE_ROLE },
    { name: READ_ROLE },
    { name: DELETE_ROLE },
    { name: EDIT_ROLE },
    { name: TRADING },
    { name: MANAGE_EXCHANGE_RATES, publish: false },
    { name: Create_On_Hold },
    { name: Release_On_Hold },
    { name: Create_WholeSale },
    { name: View_Customer },
    { name: Create_Inventory },
    { name: Read_Inventory },
    { name: Edit_Inventory },
    // Add more permissions as needed
  ];

  for (const permission of permissions) {
    await createPermission(permission);
  }

  async function createRole(roleData) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (existingRole) {
      console.log(`Role '${roleData.name}' already exists`);
    } else {
      await prisma.role.create({ data: roleData });
      console.log(`Role '${roleData.name}' created`);
    }
  }

  const roles = [
    { name: "Admin", isMain: true },
    { name: "Manager" },
    { name: "Teller" },
  ];

  for (const role of roles) {
    await createRole(role);
  }

  const superAdminData = {
    name: "Admin",
    email: "info@admin.com",
    password: await bcrypt.hash("secret", 10),
    publish: false,
    isDefault: true,
  };

  let user = await prisma.user.findFirst({
    where: { isDefault: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: superAdminData,
    });
    console.log(
      `Super admin with email=${user.email} and password='secret' has been created`
    );
  } else {
    console.log(`Super admin with email=${user.email} already exists`);
  }

  const superAdminRole = await prisma.role.findFirst({
    where: { name: "Admin" },
  });

  const superAdminUserRole = await prisma.userRoles.findMany({
    where: { userId: user.id },
  });

  if (superAdminUserRole.length === 0) {
    await prisma.userRoles.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
      },
    });
    console.log("Super admin role is assigned to user");
  } else {
    console.log("User has role Super admin");
  }

  const permissionsData = await prisma.permission.findMany();

  const superAdminPermissionRoleInput = permissionsData.map((permission) => ({
    roleId: superAdminRole.id,
    permissionId: permission.id,
  }));

  const response = await prisma.permissionRoles.createMany({
    data: superAdminPermissionRoleInput,
    skipDuplicates: true,
  });

  const superAdminPermissionInput = permissionsData.map((permission) => ({
    userId: user.id,
    permissionId: permission.id,
  }));
  const userpermission_response = await prisma.userPermissions.createMany({
    data: superAdminPermissionInput,
    skipDuplicates: true,
  });

  if (response) {
    console.log("Super admin has been given all permissions");
  }
}

permissionSeeder()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
