import argon2 from 'argon2';
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { doctorEditSchema, doctorSchema } from "../../../schema/doctor";
import { z } from 'zod';
import { uploadFile } from '../../s3/uploadFile';
import { parseFile } from '../../utils/base64toFile';

export const doctorRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(255),
    }))
    .query(async ({ input, ctx }) => {
      const { query } = input;

      const doctors = await ctx.prisma.doctor.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              surname: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              middlename: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          user: true,
          department: true,
          service: true,
        },
      });

      return doctors;
    }),
  register: protectedProcedure
    .input(doctorSchema)
    .mutation(async ({ input, ctx }) => {
      const { pin, password, departmentId, serviceId, avatar, ...rest } = input;

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

      if (avatar) {
        const file = parseFile(avatar);

        if (file) {
          await uploadFile(`avatars/${input.pin}`, file.data);
        }
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

      const { departmentId, serviceId, avatar, ...rest } = input;

      const creator = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!creator || creator.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      if (avatar) {
        const file = parseFile(avatar);

        if (file) {
          await uploadFile(`avatars/${input.pin}`, file.data);
        }
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
