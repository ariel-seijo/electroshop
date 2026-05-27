import { PrismaClient, Role } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { hash } = require("@node-rs/bcrypt");

import { gpus } from "./data/gpus";
import { cpus } from "./data/cpus";
import { rams } from "./data/rams";
import { storage } from "./data/storage";
import { buildProduct } from "./data/helpers";

const prisma = new PrismaClient();

async function main() {
  const seedPassword =
    process.env.SEED_ADMIN_PASSWORD || randomBytes(16).toString("hex");
  const hashedPassword = await hash(seedPassword, 12);

  const testUsers: Array<{ email: string; password: string; role: Role }> = [
    { email: "admin@electroshop.com", password: hashedPassword, role: "ADMIN" },
    {
      email: "user@test.com",
      password: hashedPassword,
      role: "CUSTOMER",
    },
  ];

  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: u.password, role: u.role },
      create: { email: u.email, password: u.password, role: u.role },
    });
  }

  console.log("Usuarios de prueba creados:");
  console.log("  - admin@electroshop.com");
  console.log("  - user@test.com");
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`  Password generada: ${seedPassword}`);
  }

  const gpu = await prisma.category.upsert({
    where: { name: "GPU" },
    update: {},
    create: { name: "GPU" },
  });

  const cpu = await prisma.category.upsert({
    where: { name: "CPU" },
    update: {},
    create: { name: "CPU" },
  });

  const ram = await prisma.category.upsert({
    where: { name: "RAM" },
    update: {},
    create: { name: "RAM" },
  });

  const sto = await prisma.category.upsert({
    where: { name: "STORAGE" },
    update: {},
    create: { name: "STORAGE" },
  });

  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    ...gpus.map((p) => buildProduct(p, gpu.id, "GPU")),
    ...cpus.map((p) => buildProduct(p, cpu.id, "CPU")),
    ...rams.map((p) => buildProduct(p, ram.id, "RAM")),
    ...storage.map((p) => buildProduct(p, sto.id, "STORAGE")),
  ];

  await prisma.product.createMany({
    data: products,
  });
}

main()
  .then(() => console.log("Seed completo 🌱"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
