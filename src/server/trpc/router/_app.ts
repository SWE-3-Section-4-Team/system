import { router } from "../trpc";
import { authRouter } from "./auth";
import { patientRouter } from "./patient";
import { doctorRouter } from "./doctor";
import { departmentRouter } from "./department";

export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
  doctor: doctorRouter,
  departments: departmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
