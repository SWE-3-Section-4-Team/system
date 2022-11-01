import { router } from "../trpc";
import { authRouter } from "./auth";
import { patientRouter } from "./patient";

export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
