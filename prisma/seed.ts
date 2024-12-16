import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  // Check the command-line argument
  //npx prisma db seed seeder1
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: npx prisma db seed <seeder>");
    process.exit(1);
  }

  const seederName = args[0];

  if (seederName === "seeder1") {
    require("./permissionSeeder");
  } else if (seederName === "seeder2") {
    require("./settingSeeder");
  } else {
    console.error("Unknown seeder");
    process.exit(1);
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
