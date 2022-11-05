import type { User as PrismaUser } from "@prisma/client";

export interface User {
    id: string;
    role: PrismaUser['role'];
    name: string;
}
