import { BloodType, MartialStatus } from "@prisma/client"

export const bloodTypeToLabel = {
    [BloodType.Apositive]: "A+",
    [BloodType.Anegative]: "A-",
    [BloodType.Bpositive]: "B+",
    [BloodType.Bnegative]: "B-",
    [BloodType.ABpositive]: "AB+",
    [BloodType.ABnegative]: "AB-",
    [BloodType.Opositive]: "O+",
    [BloodType.Onegative]: "O-",
}

export const martialStatusToLabel = {
    [MartialStatus.MARRIED]: "Married",
    [MartialStatus.SINGLE]: "Single",
}