import { patientSchema } from "../../../schema/patient";
import { router, publicProcedure } from "../trpc";

export const patientRouter = router({
  register: publicProcedure
    .input(patientSchema)
    .mutation(async ({ input, ctx }) => {
      const { pin, password, ...rest } = input;

      const exists = await ctx.prisma.user.findUnique({
        where: { pin },
      });

      if (exists) {
        throw new Error("User already exists");
      }

      const user = await ctx.prisma.user.create({
        data: {
          pin,
          password,
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
});
