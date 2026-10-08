import "dotenv/config";
import { database } from "../src/lib/prisma";
const db = database();
await db.adminSession.deleteMany({ where: { expires_at: { lt: new Date() } } });
await db.rateLimit.deleteMany({
  where: { expires_at: { lt: new Date(Date.now() - 3600000) } },
});
await db.$disconnect();
console.log("Expired sessions and rate counters removed.");
