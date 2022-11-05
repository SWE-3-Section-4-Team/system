import { useFormik } from "formik";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Stack } from "../../components/Stack";
import { Title } from "../../components/Typography";
import { doctorSchema, type DoctorSchema } from "../../schema/doctor";
import { trpc } from "../../utils/trpc";
import { zodToFormik } from "../../utils/zodToFormik";

export const DoctorRegister = () => {
    const { mutateAsync } = trpc.doctor.register.useMutation({
        onError: ({ message }) => toast.error(message),
    });

    const { data: departments } = trpc.departments.get.useQuery();

    const { getFieldProps, touched, values, setFieldValue, errors, handleSubmit } = useFormik<DoctorSchema>({
        initialValues: {
            pin: '',
            password: '',
            name: '',
            surname: '',
            middlename: '',
            phone: '',
            departmentId: '',
            serviceId: '',
        },
        onSubmit: (values, { resetForm }) => {
            const promise = mutateAsync(values).then(() => {
                resetForm();
            });
            toast.promise(promise, {
                loading: 'Registering...',
                success: 'Registered',
                error: 'Failed to register',
            });
        },
        validateOnBlur: true,
        validationSchema: zodToFormik(doctorSchema),
    });

    const { data: services } = trpc.departments.getServices.useQuery(values.departmentId);

    const getError = React.useCallback((name: keyof DoctorSchema) => {
        return touched[name] && errors[name] ? errors[name] : undefined;
    }, [touched, errors]);

    return (
        <div style={{
            padding: '48px 0',
        }}>
            <Container size="xs" center={false}>
                <Title level={1}>Register a doctor</Title>
                <form onSubmit={handleSubmit}>
                    <Stack direction="column" gap={8}>
                        <Input
                            label="PIN"
                            {...getFieldProps('pin')}
                            error={getError('pin')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            {...getFieldProps('password')}
                            error={getError('password')}
                        />
                        <Input
                            label="Name"
                            {...getFieldProps('name')}
                            error={getError('name')}
                        />
                        <Input
                            label="Surname"
                            {...getFieldProps('surname')}
                            error={getError('surname')}
                        />
                        <Input
                            label="Middlename"
                            {...getFieldProps('middlename')}
                            error={getError('middlename')}
                        />
                        <Input
                            label="Phone"
                            mask="+7 (999) 999-9999"
                            {...getFieldProps('phone')}
                            error={getError('phone')}
                        />
                        <Select
                            value={values.departmentId}
                            label="Department"
                            onValueChange={(value) => setFieldValue('departmentId', value)}
                            items={Object.values(departments || []).map((value) => ({
                                label: value.name,
                                value: value.id,
                            }))}
                        />
                        <Select
                            value={values.serviceId}
                            label="Services"
                            onValueChange={(value) => setFieldValue('serviceId', value)}
                            items={Object.values(services || []).map((value) => ({
                                label: value.name,
                                value: value.id,
                            }))}
                        />
                        <div />
                        <Button type="submit" size="large" variant="primary">Register</Button>
                    </Stack>
                </form>
            </Container>
        </div>
    );
};