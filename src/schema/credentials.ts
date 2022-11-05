import { z } from "zod";

export const credentialsSchema = z.object({
    pin: z.string(),
    password: z.string(),
});

export type CredentialsSchema = z.infer<typeof credentialsSchema>;