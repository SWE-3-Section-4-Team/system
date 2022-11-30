import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const departmentRouter = router({
    get: publicProcedure
        .query(async ({ ctx }) => {
            const departments = await ctx.prisma.department.findMany();
            return departments;
        }),
    getServices: publicProcedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
            const services = await ctx.prisma.service.findMany({
                where: {
                    departmentId: input,
                },
            });
            return services;
        }),
    getAllSerivces: publicProcedure
        .query(async ({ ctx }) => {
            const departments = await ctx.prisma.department.findMany();
            const services = await ctx.prisma.service.findMany();

            const departmentServices = departments.map((department) => {
                return {
                    department,
                    services: services.filter(
                        (service) => service.departmentId === department.id
                    ),
                };
            });

            return departmentServices;
        }),
})