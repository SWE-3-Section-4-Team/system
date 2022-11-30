import type { Patient } from "@prisma/client";
import { BloodType, MartialStatus } from "@prisma/client";
import React from "react";
import { z } from "zod";
import { Avatar } from "../../components/Avatar";
import type { Field, FieldDef } from "../../components/CRUD";
import { CRUD } from "../../components/CRUD";
import { bloodTypeToLabel, martialStatusToLabel } from "../../constants/patient";
import { AdminLayout } from "../../layout/AdminLayout";
import { PIN_REGEXP, TEL_REGEXP } from "../../schema/doctor";
import type { PatientEditSchema, PatientSchema } from "../../schema/patient";
import type { Page } from "../../types/page";
import { trpc } from "../../utils/trpc";

const Patients: Page = () => {
    const { patient: { get: { invalidate: invalidateGet } } } = trpc.useContext();

    const { data } = trpc.patient.get.useQuery();
    const { mutateAsync: update } = trpc.patient.update.useMutation();
    const { mutateAsync: create } = trpc.patient.register.useMutation();

    const rows = React.useMemo(() => data?.map(({ user: _, ...patient }) => ({
        ...patient,
    })), [data]);

    const columns = React.useMemo<FieldDef<Patient>[]>(() => [
        {
            field: 'avatar' as keyof Patient,
            label: 'Avatar',
            type: 'image',
            width: 100,
            schema: z.string().optional(),
            render: ({ pin, name, surname }) => <Avatar size="sm" pin={pin} name={`${name} ${surname}`} />
        },
        {
            field: 'pin',
            label: 'PIN',
            type: 'text',
            schema: z.string(),
            width: 150,
            notEditable: true,
        },
        {
            field: 'name',
            label: 'First name',
            type: 'text',
            schema: z.string(),
            width: 150,
        },
        {
            field: 'surname',
            label: 'Surname',
            type: 'text',
            schema: z.string(),
            width: 150,
        },
        {
            field: 'middlename',
            label: 'Middlename',
            type: 'text',
            schema: z.string(),
            width: 150,
        },
        {
            field: 'email',
            label: 'Phone',
            type: 'text',
            schema: z.string().email(),
            width: 150,
        },
        {
            field: 'address',
            label: 'Address',
            type: 'text',
            schema: z.string(),
        },
        {
            field: 'bloodType',
            label: 'Blood type',
            type: 'select',
            schema: z.string(),
            valueOptions: Object.values(BloodType).map((value) => ({
                label: bloodTypeToLabel[value],
                value,
            })),
        },
    ], []);

    const fields = React.useMemo<Field<PatientSchema>[]>(() => [
        {
            field: 'avatar',
            label: 'Avatar',
            type: 'image',
            schema: z.string().optional(),
        },
        {
            field: 'pin',
            label: 'PIN',
            type: 'text',
            schema: z.string().regex(PIN_REGEXP),
        },
        {
            field: 'password',
            label: 'Password',
            type: 'password',
            schema: z.string().min(8).max(255),
        },
        {
            field: 'name',
            label: 'First name',
            type: 'text',
            schema: z.string(),
        },
        {
            field: 'surname',
            label: 'Surname',
            type: 'text',
            schema: z.string(),
        },
        {
            field: 'middlename',
            label: 'Middlename',
            type: 'text',
            schema: z.string(),
        },
        {
            field: 'phone',
            label: 'Phone',
            mask: '+7 (999) 999-9999',
            type: 'text',
            schema: z.string().regex(TEL_REGEXP),
        },
        {
            field: 'emergencyPhone',
            label: 'Emergency phone',
            mask: '+7 (999) 999-9999',
            type: 'text',
            schema: z.string().regex(TEL_REGEXP),
        },
        {
            field: 'address',
            label: 'Address',
            type: 'text',
            schema: z.string(),
        },
        {
            field: 'email',
            label: 'Email',
            type: 'text',
            schema: z.string().email(),
        },
        {
            field: 'bloodType',
            label: 'Blood type',
            type: 'select',
            schema: z.string(),
            valueOptions: Object.values(BloodType).map((value) => ({
                label: bloodTypeToLabel[value],
                value,
            })),
        },
        {
            field: 'martialStatus',
            label: 'Martial status',
            type: 'select',
            schema: z.string(),
            valueOptions: Object.values(MartialStatus).map((value) => ({
                label: martialStatusToLabel[value],
                value,
            })),
        },
    ], []);

    const handleCreate = React.useCallback(async (values: PatientSchema) => create(values), [create]);
    const handleUpdate = React.useCallback(async (values: PatientEditSchema) => update(values), [update]);

    return (
        <>
            <CRUD
                data={rows}
                columns={columns}
                title="Patients"
                fields={fields}
                create={handleCreate}
                update={handleUpdate}
                invalidate={invalidateGet}
                newInitial={{
                    pin: '',
                    password: '',
                    name: '',
                    surname: '',
                    middlename: '',
                    phone: '',
                    emergencyPhone: '',
                    address: '',
                    email: '',
                    bloodType: BloodType.Apositive,
                    martialStatus: MartialStatus.SINGLE,
                }}
            />
        </>
    )
}

Patients.layout = AdminLayout;

export default Patients;
