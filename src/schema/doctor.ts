import { z } from "zod";

/* 000000000000 */
export const PIN_REGEXP = /^[0-9]{12}$/;

/* +7 (999) 999-9999 */
export const TEL_REGEXP = /^(\+\d{1}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

export const doctorSchema = z.object({
    avatar: z.string().optional(),
    pin: z.string().regex(PIN_REGEXP),
    password: z.string().min(8).max(255),
    name: z.string().min(1).max(255),
    surname: z.string().min(1).max(255),
    middlename: z.string().min(1).max(255),
    phone: z.string().regex(TEL_REGEXP),
    departmentId: z.string(),
    serviceId: z.string(),
});

export type DoctorSchema = z.infer<typeof doctorSchema>;

export const doctorEditSchema = z.object({
    avatar: z.string().optional(),
    pin: z.string().regex(PIN_REGEXP),
    name: z.string().min(1).max(255),
    surname: z.string().min(1).max(255),
    middlename: z.string().min(1).max(255),
    departmentId: z.string(),
    serviceId: z.string(),
});

export type DoctorEditSchema = z.infer<typeof doctorEditSchema>;