import type { Doctor } from "@prisma/client";
import React from "react";
import { z } from "zod";
import { Avatar } from "../../components/Avatar";
import type { Field, FieldDef } from "../../components/CRUD";
import { CRUD } from "../../components/CRUD";
import { AdminLayout } from "../../layout/AdminLayout";
import type { DoctorEditSchema, DoctorSchema} from "../../schema/doctor";
import { PIN_REGEXP, TEL_REGEXP } from "../../schema/doctor";
import type { Page } from "../../types/page";
import { trpc } from "../../utils/trpc";

const Doctors: Page = () => {
    const { doctor: { get: { invalidate: invalidateGet } } } = trpc.useContext();
    const { data: all } = trpc.departments.getAllSerivces.useQuery();

    const { data } = trpc.doctor.get.useQuery();
    const { mutateAsync: update } = trpc.doctor.update.useMutation();
    const { mutateAsync: create } = trpc.doctor.register.useMutation();

    const rows = React.useMemo(() => data?.map(({ user: _, ...doctor }) => ({
        ...doctor,
    })), [data]);

    const columns = React.useMemo<FieldDef<Doctor>[]>(() => [
        {
            field: 'avatar' as keyof Doctor,
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
            field: 'phone',
            label: 'Phone',
            type: 'text',
            schema: z.string().regex(TEL_REGEXP),
            mask: '+7 (999) 999-9999',
            width: 150,
        },
        {
            field: 'departmentId',
            label: 'Department',
            type: 'select',
            schema: z.string(),
            valueOptions: (all || []).map(({ department }) => ({
                label: department.name,
                value: department.id,
            })),
        },
        {
            field: 'serviceId',
            label: 'Service',
            type: 'select',
            schema: z.string(),
            valueOptions: (value: Doctor) => {
                const department = all?.find((department) => department.department.id === value.departmentId);
                if (department) {
                    return department.services.map((service) => ({
                        label: service.name,
                        value: service.id,
                    }));
                }
                return [];
            },
        },
    ], [all]);

    const fields = React.useMemo<Field<DoctorSchema>[]>(() => [
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
            field: 'departmentId',
            label: 'Department',
            type: 'select',
            schema: z.string(),
            valueOptions: (all || []).map(({ department }) => ({
                label: department.name,
                value: department.id,
            })),
        },
        {
            field: 'serviceId',
            label: 'Service',
            type: 'select',
            schema: z.string(),
            valueOptions: ({ departmentId }) => {
                const department = all?.find((department) => department.department.id === departmentId);
                if (department) {
                    return department.services.map((service) => ({
                        label: service.name,
                        value: service.id,
                    }));
                }
                return [];
            },
        },
    ], [all]);

    const handleCreate = React.useCallback(async (values: DoctorSchema) => create(values), [create]);
    const handleUpdate = React.useCallback(async (values: DoctorEditSchema) => update(values), [update]);

    return (
        <>
            <CRUD
                data={rows}
                columns={columns}
                title="Doctors"
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
                    departmentId: '',
                    serviceId: '',
                }}
            />
        </>
    )
}

Doctors.layout = AdminLayout;

export default Doctors;
