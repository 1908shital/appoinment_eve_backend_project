import dns from "dns";
import { PrismaClient } from "@prisma/client";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  transactionOptions: {
    maxWait: 10000,
    timeout: 30000,
  },
});

export default prisma;
