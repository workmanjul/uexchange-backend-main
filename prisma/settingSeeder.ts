// prisma/seed/seeder2.ts

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function settingSeeder() {
  const settings = [
    { email: "" },
    // Add more settings as needed
  ];

  const existingSettings = await prisma.setting.findMany();

  if (existingSettings.length > 0) {
    await prisma.setting.deleteMany();
    console.log(`Settings deleted`);
  }

  await prisma.setting.createMany({ data: settings });
  console.log(`Settings created`);
}

settingSeeder()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
