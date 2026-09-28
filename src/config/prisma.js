const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  transactionOptions: {
    maxWait: 10000,
    timeout: 30000,
  },
});

module.exports = prisma;
