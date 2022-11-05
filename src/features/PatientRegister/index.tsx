import { BloodType, MartialStatus } from "@prisma/client";
import { useFormik } from "formik";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Stack } from "../../components/Stack";
import { Title } from "../../components/Typography";
import { bloodTypeToLabel, martialStatusToLabel } from "../../constants/patient";
import { patientSchema, type PatientSchema } from "../../schema/patient";
import { trpc } from "../../utils/trpc";
import { zodToFormik } from "../../utils/zodToFormik";

export const PatientRegister: React.FC = () => {
    const { mutateAsync } = trpc.patient.register.useMutation({
        onError: ({ message }) => toast.error(message),
    });
    const { getFieldProps, touched, values, setFieldValue, errors, handleSubmit } = useFormik<PatientSchema>({
        initialValues: {
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
        validationSchema: zodToFormik(patientSchema),
    });

    const getError = React.useCallback((name: keyof PatientSchema) => {
        return touched[name] && errors[name] ? errors[name] : undefined;
    }, [touched, errors]);

    return (
        <div style={{
            padding: '48px 0',
        }}>
            <Container size="xs" center={false}>
                <Title level={1}>Register a patient</Title>

                <form onSubmit={handleSubmit}>
                    <Stack direction="column" gap={8}>
                        <Input
                            label="PIN"
                            error={getError('pin')}
                            {...getFieldProps('pin')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            error={getError('password')}
                            {...getFieldProps('password')}
                        />
                        <Input
                            label="Name"
                            error={getError('name')}
                            {...getFieldProps('name')}
                        />
                        <Input
                            label="Surname"
                            error={getError('surname')}
                            {...getFieldProps('surname')}
                        />
                        <Input
                            label="Middle name"
                            error={getError('middlename')}
                            {...getFieldProps('middlename')}
                        />
                        <Input
                            label="Phone"
                            mask="+7 (999) 999-9999"
                            error={getError('phone')}
                            {...getFieldProps('phone')}
                        />
                        <Input
                            label="Emergency phone"
                            mask="+7 (999) 999-9999"
                            error={getError('emergencyPhone')}
                            {...getFieldProps('emergencyPhone')}
                        />
                        <Input
                            label="Address"
                            error={getError('address')}
                            {...getFieldProps('address')}
                        />
                        <Input
                            label="Email"
                            error={getError('email')}
                            {...getFieldProps('email')}
                        />
                        <Select
                            value={values.bloodType}
                            label="Blood type"
                            onValueChange={(value) => setFieldValue('bloodType', value)}
                            items={Object.values(BloodType).map((value) => ({
                                label: bloodTypeToLabel[value],
                                value,
                            }))}
                        />
                        <Select
                            value={values.martialStatus}
                            label="Martial status"
                            onValueChange={(value) => setFieldValue('martialStatus', value)}
                            items={Object.values(MartialStatus).map((value) => ({
                                label: martialStatusToLabel[value],
                                value,
                            }))}
                        />
                        <div />
                        <Button type="submit" size="large" variant="primary">Register</Button>
                    </Stack>
                </form>
            </Container>
        </div>
    )
}