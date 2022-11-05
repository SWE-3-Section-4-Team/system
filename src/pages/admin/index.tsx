import { ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { GetServerSideProps, type NextPage } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import React from "react";
import { Container } from "../../components/Container";
import { Menu, MenuItemWithIcon } from "../../components/Menu";
import { Page } from "../../components/Page";
import { Stack } from "../../components/Stack";
import { Tabs } from "../../components/Tabs";
import { Title } from "../../components/Typography";
import { User } from "../../components/User";
import { Doctors } from "../../features/Doctors";
import { Patients } from "../../features/Patients";
import { withAuth } from "../../utils/withAuth";

const AdminPage: NextPage = () => {
    const [tab, setTab] = React.useState<'patients' | 'doctors'>('patients');
    const logout = React.useCallback(() => signOut(), []);

    return (
        <Page>
            <Container>
                <Stack alignItems="center" justifyContent="space-between">
                    <Title level={2}>Admin Dashboard</Title>
                    <Menu
                        align="end"
                        withArrow={false}
                        content={(
                            <>
                                {/* <Link href="/dashboard">
                                    <MenuItemWithIcon
                                        icon={<PersonIcon />}
                                    >
                                        Profile
                                    </MenuItemWithIcon>
                                </Link> */}
                                <MenuItemWithIcon
                                    icon={<ExitIcon />}
                                    onClick={logout}
                                >
                                    Logout
                                </MenuItemWithIcon>
                            </>
                        )}>
                        <User size="md" />
                    </Menu>
                </Stack>
                <Stack direction="column" gap={16}>
                    <Tabs
                        value={tab}
                        onChange={(value) => setTab(value as 'patients' | 'doctors')}
                        items={[
                            { value: 'patients', label: 'Patients' },
                            { value: 'doctors', label: 'Doctors' },
                        ]}
                    />
                    {tab === 'patients' && (
                        <Patients />
                    )}
                    {tab === 'doctors' && (
                        <Doctors />
                    )}
                </Stack>
            </Container>
        </Page>
    )
}

export default AdminPage;

export const getServerSideProps = withAuth(async (ctx, user) => {
    if (user.role !== 'ADMIN') {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
});
