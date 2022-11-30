import { Avatar } from "../../components/Avatar";
import { Stack } from "../../components/Stack";
import { Table } from "../../components/Table";
import { Text, Title } from "../../components/Typography";
import { AdminLayout } from "../../layout/AdminLayout";
import type { Page } from '../../types/page';
import { trpc } from "../../utils/trpc";

const AdminPage: Page = () => {
    const { data } = trpc.patient.getAppointments.useQuery();
    const { data: all } = trpc.departments.getAllSerivces.useQuery();


    return (
        <>
            <Title font={24}>Appointments</Title>
            <Table
                columns={[
                    {
                        key: 'name',
                        title: 'Name',
                    },
                    {
                        key: 'surname',
                        title: 'Surname',
                    },
                    {
                        key: 'serviceId',
                        title: 'Service',
                        render: (row) => {
                            const department = all?.find(({ department }) => department.id === row.departmentId);

                            if (!department) {
                                return null;
                            }

                            const service = department.services.find(({ id }) => id === row.serviceId);

                            return `${department.department.name} - ${service?.name}`;
                        },
                    },
                    {
                        key: 'doctorId',
                        title: 'Doctor',
                        render: (row) => {
                            if (!row.doctor) {
                                return '-';
                            }
                            return (
                                <Stack alignItems="center" gap={8}>
                                    <Avatar pin={row.doctor.pin} name={`${row.doctor.name} ${row.doctor.surname}`} />
                                    <Text size="sm">{`${row.doctor.name} ${row.doctor.surname}`}</Text>
                                </Stack>
                            )
                        },
                    },
                    {
                        key: 'date',
                        title: 'Date',
                        render: (row) => {
                            return new Date(row.date).toLocaleDateString();
                        },
                    },
                    {
                        key: 'phone',
                        title: 'Phone',
                    },
                    {
                        key: 'email',
                        title: 'Email',
                    }
                ]}
                data={data || []}
            />
        </>
    )
}

AdminPage.layout = AdminLayout;

export default AdminPage;
