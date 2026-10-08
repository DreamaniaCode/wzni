import "dotenv/config";
import { database } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12)
  throw new Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) for this command only.",
  );
const db = database();
await db.adminUser.upsert({
  where: { email },
  create: { email, password_hash: await hashPassword(password) },
  update: { password_hash: await hashPassword(password), active: true },
});
await db.$disconnect();
console.log(
  "Administrator created/updated. Remove ADMIN_PASSWORD from your environment.",
);
