import { env } from "@better-auth-mercadopago/env/server";
import { PrismaPg } from "@prisma/adapter-pg";

// oxlint-disable-next-line import/no-relative-parent-imports
import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;
