const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN", description: "Administrator System" },
  });

  const fotoRole = await prisma.role.upsert({
    where: { name: "FOTOGRAFER" },
    update: {},
    create: { name: "FOTOGRAFER", description: "Fotografer Studio" },
  });

  const pelangganRole = await prisma.role.upsert({
    where: { name: "PELANGGAN" },
    update: {},
    create: { name: "PELANGGAN", description: "Pelanggan Studio" },
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@visualspace.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@visualspace.com",
      password: passwordHash,
      roleId: adminRole.id,
    },
  });

  const fotografer = await prisma.user.upsert({
    where: { email: "foto@visualspace.com" },
    update: {},
    create: {
      name: "Fotografer Utama",
      email: "foto@visualspace.com",
      password: passwordHash,
      roleId: fotoRole.id,
    },
  });

  const pelanggan = await prisma.user.upsert({
    where: { email: "pelanggan@example.com" },
    update: {},
    create: {
      name: "Budi Pelanggan",
      email: "pelanggan@example.com",
      password: passwordHash,
      phoneNumber: "08123456789",
      roleId: pelangganRole.id,
    },
  });

  // 3. Create Packages
  const pkg1 = await prisma.package.create({
    data: {
      name: "Paket Basic Studio",
      price: 150000,
      printCount: 5,
      description: "Sesi foto 30 menit. Maksimal 5 orang. Mendapatkan 5 file cetak fisik.",
      isActive: true,
    },
  }).catch(() => console.log("Pkg1 exists"));

  const pkg2 = await prisma.package.create({
    data: {
      name: "Paket Prewedding Indoor",
      price: 750000,
      printCount: 20,
      description: "Sesi foto 2 jam. 2 kostum. Mendapatkan 20 foto cetak dan 1 pigura 16R.",
      isActive: true,
    },
  }).catch(() => console.log("Pkg2 exists"));

  // 4. Create Default System Settings
  await prisma.systemSetting.upsert({ where: { key: "OPENING_HOUR" }, update: {}, create: { key: "OPENING_HOUR", value: "09:00" } });
  await prisma.systemSetting.upsert({ where: { key: "CLOSING_HOUR" }, update: {}, create: { key: "CLOSING_HOUR", value: "21:00" } });
  await prisma.systemSetting.upsert({ where: { key: "DP_DEADLINE_HOURS" }, update: {}, create: { key: "DP_DEADLINE_HOURS", value: "24" } });
  await prisma.systemSetting.upsert({ where: { key: "FULL_PAYMENT_DEADLINE_HOURS" }, update: {}, create: { key: "FULL_PAYMENT_DEADLINE_HOURS", value: "24" } });
  await prisma.systemSetting.upsert({ where: { key: "DP_MIN_DAYS_AHEAD" }, update: {}, create: { key: "DP_MIN_DAYS_AHEAD", value: "7" } });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
