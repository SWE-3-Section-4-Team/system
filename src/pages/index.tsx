import type { Doctor } from "@prisma/client";
import { CheckCircledIcon, CheckIcon, EnterIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { Divider } from "../components/Divider";
import { Input } from "../components/Input";
import { Page } from "../components/Page";
import { Select } from "../components/Select";
import { Stack } from "../components/Stack";
import { Text, Title } from "../components/Typography";
import type { AppointmentRequestSchema } from "../schema/patient";
import { appointmentRequestSchema } from "../schema/patient";
import { trpc } from "../utils/trpc";
import { zodToFormik } from "../utils/zodToFormik";

const Home = () => {
    const [text, setText] = React.useState('');

    const { data: all } = trpc.departments.getAllSerivces.useQuery();

    const { mutateAsync: create } = trpc.patient.appointment.useMutation();

    const { data } = trpc.doctor.search.useQuery({ query: text }, {
        enabled: text.length > 0,
    });

    const { values, setFieldValue, getFieldProps, touched, errors, handleSubmit } = useFormik<AppointmentRequestSchema>({
        initialValues: {
            departmentId: '',
            serviceId: '',
            date: (new Date()).toISOString().split('T')[0] || '',
            name: '',
            surname: '',
            phone: '',
            email: '',
        },
        onSubmit: async (values, { resetForm }) => {
            const promise = create(values).then(() => {
                resetForm();
                setText('');
            });
            toast.promise(promise, {
                loading: 'Sending request...',
                success: 'Your request has been sent',
                error: 'Error occured',
            });
        },
        validateOnBlur: true,
        validationSchema: zodToFormik(appointmentRequestSchema),
    })

    const onDoctorSelect = React.useCallback((doctor: Doctor) => {
        setFieldValue('doctorId', doctor.id);
        setFieldValue('departmentId', doctor.departmentId);
        setFieldValue('serviceId', doctor.serviceId);
    }, [setFieldValue]);

    const onDepartmentSelect = React.useCallback((departmentId: string) => {
        setFieldValue('departmentId', departmentId);
        setFieldValue('serviceId', '');
        setFieldValue('doctorId', '');
    }, [setFieldValue]);

    const onServiceSelect = React.useCallback((serviceId: string) => {
        setFieldValue('serviceId', serviceId);
        setFieldValue('doctorId', '');
    }, [setFieldValue]);

    const departments = React.useMemo(() => {
        if (!all) {
            return [];
        }

        return all.map(({ department }) => ({
            label: department.name,
            value: department.id,
        }))
    }, [all]);

    const services = React.useMemo(() => {
        if (!all) {
            return [];
        }
        const dept = all?.find((item) => item.department.id === values.departmentId);
        if (dept) {
            return dept.services.map((service) => ({
                label: service.name,
                value: service.id,
            }));
        }
        return [];
    }, [all, values.departmentId]);

    const getError = React.useCallback((name: keyof AppointmentRequestSchema) => {
        return touched[name] && errors[name] ? errors[name] : undefined;
    }, [touched, errors]);

    return (
        <Page>
            <Container size="sm">
                <Stack direction="column" gap={24}>
                    <Stack fullWidth alignItems="center" justifyContent="space-between">
                        <Title noMargin>Make an appointment</Title>
                        <Stack alignItems="center" gap={12}>
                            <Text font={13} type="secondary">or</Text>
                            <Link href="/login">
                                <Button variant="primary" icon={<EnterIcon />}>Login</Button>
                            </Link>
                        </Stack>
                    </Stack>
                    <Input
                        placeholder="Search"
                        icon={<MagnifyingGlassIcon />}
                        value={text}
                        label="Search for a doctor"
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Stack direction="column" gap={8}>
                        {data?.map((row, i) => (
                            <React.Fragment key={row.id}>
                                {i > 0 ? <Divider /> : null}
                                <Stack alignItems="center" gap={12}>
                                    <Avatar
                                        pin={row.pin}
                                        name={`${row.name} ${row.surname}`}
                                        size="md"
                                    />
                                    <Stack grow={1} gap={2} direction="column">
                                        <Text as="b" size="sm">{row.name} {row.surname}</Text>
                                        <Text type="secondary" size="xs">{row.department.name} → {row.service.name}</Text>
                                    </Stack>
                                    <Button
                                        variant={values.doctorId === row.id ? 'primary' : 'default'}
                                        onClick={() => onDoctorSelect(row)}
                                        icon={values.doctorId === row.id ? <CheckCircledIcon /> : undefined}
                                    >
                                        {row.id === values.doctorId ? 'Selected' : 'Select'}
                                    </Button>
                                </Stack>
                            </React.Fragment>
                        ))}
                    </Stack>
                    <Stack alignItems="center" gap={12}>
                        <Divider />
                        <Text style={{ flexShrink: 0 }} font={15} type="secondary">or select a service</Text>
                        <Divider />
                    </Stack>
                    <Stack alignItems="center" gap={16}>
                        <Select
                            label="Department"
                            style={{ width: '50%' }}
                            value={values.departmentId}
                            onValueChange={onDepartmentSelect}
                            items={departments}
                        />
                        <Text style={{
                            marginTop: 24,
                            flexShrink: 0,
                        }} type="secondary">→</Text>
                        <Select
                            label="Service"
                            value={values.serviceId}
                            style={{ width: '50%' }}
                            disabled={!values.departmentId}
                            onValueChange={onServiceSelect}
                            items={services}
                        />
                    </Stack>
                    <form onSubmit={handleSubmit}>
                        <Stack direction="column" gap={16}>
                            <Input
                                label="Preferred date"
                                type="date"
                                {...getFieldProps('date')}
                                error={getError('date')}
                            />
                            <Input
                                label="Name"
                                type="text"
                                {...getFieldProps('name')}
                                error={getError('name')}
                            />
                            <Input
                                label="Surname"
                                type="text"
                                {...getFieldProps('surname')}
                                error={getError('surname')}
                            />
                            <Input
                                label="Telephone"
                                type="text"
                                mask="+7 (999) 999-9999"
                                {...getFieldProps('phone')}
                                error={getError('phone')}
                            />
                            <Input
                                label="Email"
                                type="email"
                                {...getFieldProps('email')}
                                error={getError('email')}
                            />
                            <Button type="submit" variant="primary">Submit</Button>
                        </Stack>
                    </form>
                </Stack>
            </Container>
        </Page>
    )
}

export default Home;