import { appointmentRequestSchema, patientEditSchema, patientSchema } from "../../../schema/patient";
import argon2 from 'argon2';
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { parseFile } from "../../utils/base64toFile";
import { uploadFile } from "../../s3/uploadFile";
import { z } from "zod";

export const patientRouter = router({
  register: protectedProcedure
    .input(patientSchema)
    .mutation(async ({ input, ctx }) => {
      const { pin, password, avatar, ...rest } = input;

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

      if (avatar) {
        const file = parseFile(avatar);

        if (file) {
          await uploadFile(`avatars/${input.pin}`, file.data);
        }
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

      const { avatar, ...rest } = input;

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

      const patient = await ctx.prisma.patient.update({
        where: {
          pin: input.pin,
        },
        data: {
          ...rest,
        },
      });

      return patient;
    }),

  appointment: publicProcedure
    .input(appointmentRequestSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.doctorId) {
        delete input.doctorId;
      }
      const appointmentRequest = await ctx.prisma.appointmentRequest.create({
        data: {
          ...input,
          date: new Date(input.date),
        },
      });

      return appointmentRequest;
    }),
  getAppointments: protectedProcedure
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

      const appointments = await ctx.prisma.appointmentRequest.findMany({
        include: {
          doctor: true,
        },
      });

      return appointments;
    }),
});
