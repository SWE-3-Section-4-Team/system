import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const departmentRouter = router({
    get: protectedProcedure
        .query(async ({ ctx }) => {
            const departments = await ctx.prisma.department.findMany();
            return departments;
        }),
    getServices: protectedProcedure
        .input(z.string())
        .query(async ({ input, ctx }) => {
            const services = await ctx.prisma.service.findMany({
                where: {
                    departmentId: input,
                },
            });
            return services;
        }),
    getAllSerivces: protectedProcedure
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