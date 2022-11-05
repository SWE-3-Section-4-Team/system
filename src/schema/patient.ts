import { BloodType, MartialStatus } from "@prisma/client";
import { z } from "zod";

/* 000000000000 */
const PIN_REGEXP = /^[0-9]{12}$/;

/* +7 (999) 999-9999 */
const TEL_REGEXP = /^(\+\d{1}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

const BLOOD_TYPES = {
    ...BloodType,
} as const;

const MARTIAL_STATUSES = {
    ...MartialStatus,
} as const;

export const patientSchema = z.object({
    pin: z.string().regex(PIN_REGEXP),
    password: z.string().min(8).max(255),
    name: z.string().min(1).max(255),
    surname: z.string().min(1).max(255),
    middlename: z.string().min(1).max(255),
    email: z.string().email().max(255).optional().nullable(),
    emergencyPhone: z.string().regex(TEL_REGEXP).optional().nullable(),
    phone: z.string().regex(TEL_REGEXP),
    address: z.string().min(1).max(255),
    bloodType: z.nativeEnum(BLOOD_TYPES),
    martialStatus: z.nativeEnum(MARTIAL_STATUSES),
});

export type PatientSchema = z.infer<typeof patientSchema>;

export const patientEditSchema = z.object({
    pin: z.string().regex(PIN_REGEXP),
    name: z.string().min(1).max(255),
    surname: z.string().min(1).max(255),
    middlename: z.string().min(1).max(255),
    email: z.string().email().max(255).optional().nullable(),
    address: z.string().min(1).max(255),
    bloodType: z.nativeEnum(BLOOD_TYPES),
    martialStatus: z.nativeEnum(MARTIAL_STATUSES),
});

export type PatientEditSchema = z.infer<typeof patientEditSchema>;