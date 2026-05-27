import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const softDeleteModels = new Set<string>(["User"]);

          if (!softDeleteModels.has(model as string)) return query(args);

          const readOps = new Set([
            "findFirst",
            "findFirstOrThrow",
            "findMany",
            "count",
            "aggregate",
            "groupBy",
          ]);

          if (!readOps.has(operation)) return query(args);
          if (operation.startsWith("findUnique")) return query(args);

          const rawArgs = (args ?? {}) as Record<string, unknown>;
          const where = (rawArgs.where || {}) as Record<string, unknown>;
          if (where.deletedAt === undefined && !(where as Record<string, unknown>).__softDeleteBypass) {
            where.deletedAt = null;
          }
          delete (where as Record<string, unknown>).__softDeleteBypass;
          rawArgs.where = where;
          return query(rawArgs);
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
