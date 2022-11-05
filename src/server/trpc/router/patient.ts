import { patientEditSchema, patientSchema } from "../../../schema/patient";
import argon2 from 'argon2';
import { router, protectedProcedure } from "../trpc";

export const patientRouter = router({
  register: protectedProcedure
    .input(patientSchema)
    .mutation(async ({ input, ctx }) => {
      const { pin, password, ...rest } = input;

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

      const patient = await ctx.prisma.patient.create({
        data: {
          pin,
          ...rest,
          user: {
            connect: {
              id: user.id,
            }
          },
        }
      });

      return patient;
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

      const patients = await ctx.prisma.patient.findMany({
        include: {
          user: true,
        },
      });

      return patients;
    }),
  update: protectedProcedure
    .input(patientEditSchema)
    .mutation(async ({ input, ctx }) => {
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

      const patient = await ctx.prisma.patient.update({
        where: {
          pin: input.pin,
        },
        data: {
          ...input,
        },
      });

      return patient;
    }),
});
