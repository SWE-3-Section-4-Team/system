import argon2 from 'argon2';
import { router, protectedProcedure } from "../trpc";
import { doctorEditSchema, doctorSchema } from "../../../schema/doctor";

export const doctorRouter = router({
  register: protectedProcedure
    .input(doctorSchema)
    .mutation(async ({ input, ctx }) => {
      const { pin, password, departmentId, serviceId, ...rest } = input;

      if (!ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const creator = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!creator || creator.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const exists = await ctx.prisma.user.findFirst({
        where: { pin },
      });

      if (exists) {
        throw new Error("User already exists");
      }

      const hashedPassword = await argon2.hash(password);

      const user = await ctx.prisma.user.create({
        data: {
          pin,
          name: rest.name + " " + rest.surname,
          password: hashedPassword,
          role: 'PATIENT',
        },
      });

      const department = await ctx.prisma.department.findFirst({
        where: {
          id: departmentId,
        },
      });

      if (!department) {
        throw new Error("Department not found");
      }

      const service = await ctx.prisma.service.findFirst({
        where: {
          id: serviceId,
        },
      });

      if (!service) {
        throw new Error("Service not found");
      }

      const doctor = await ctx.prisma.doctor.create({
        data: {
          pin,
          ...rest,
          user: {
            connect: {
              id: user.id,
            },
          },
          department: {
            connect: {
              id: department.id,
            },
          },
          service: {
            connect: {
              id: service.id,
            },
          },
        }
      });

      return doctor;
    }),

  get: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const creator = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!creator || creator.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const doctor = await ctx.prisma.doctor.findMany({
        include: {
          user: true,
        },
      });

      return doctor;
    }),
  update: protectedProcedure
    .input(doctorEditSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const { departmentId, serviceId, ...rest } = input;

      const creator = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!creator || creator.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const department = await ctx.prisma.department.findFirst({
        where: {
          id: departmentId,
        },
      });

      if (!department) {
        throw new Error("Department not found");
      }

      const service = await ctx.prisma.service.findFirst({
        where: {
          id: serviceId,
        },
      });

      if (!service) {
        throw new Error("Service not found");
      }

      const doctor = await ctx.prisma.doctor.update({
        where: {
          pin: input.pin,
        },
        data: {
          ...rest,
          department: {
            connect: {
              id: department.id,
            },
          },
          service: {
            connect: {
              id: service.id,
            }
          }
        },
      });

      return doctor;
    }),
});
