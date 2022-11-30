import { CardStackPlusIcon, EnvelopeOpenIcon, ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { Menu, MenuItemWithIcon } from "../../components/Menu";
import { Page } from "../../components/Page";
import { Stack } from "../../components/Stack";
import { Text, Title } from "../../components/Typography";
import { User } from "../../components/User";

import cls from './AdminLayout.module.scss';

const MenuItem: React.FC<{ icon: React.ReactNode, children: React.ReactNode, href: string }> = ({
    href,
    icon,
    children,
}) => {
    const { pathname } = useRouter();

    const isActive = pathname === href;

    return (
        <Link href={href} data-active={isActive} className={cls.menuItem}>
            <div className={cls.icon}>
                {icon}
            </div>
            <div className={cls.text}>
                {children}
            </div>
        </Link>
    )
}

const MENU = [
    {
        href: '/admin',
        icon: <EnvelopeOpenIcon />,
        text: 'Requests',
    },
    {
        href: '/admin/doctors',
        icon: <CardStackPlusIcon />,
        text: 'Doctors',
    },
    {
        href: '/admin/patients',
        icon: <PersonIcon />,
        text: 'Patients',
    },
]

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const logout = React.useCallback(() => signOut(), []);

    return (
        <Stack style={{ height: '100vh' }}>
            <Stack className={cls.menu} direction="column" alignItems="stretch" justifyContent="flex-start" gap={16}>
                <Stack alignItems="center" justifyContent="space-between">
                    <Title noMargin level={2}>Admin Dashboard</Title>
                    <User size="md" />
                </Stack>
                <Stack gap={4} grow={1} direction="column">
                    {
                        MENU.map(({ href, icon, text }) => (
                            <MenuItem href={href} icon={icon} key={href}>
                                {text}
                            </MenuItem>
                        ))
                    }
                </Stack>
                <Button icon={<ExitIcon />}>
                    Logout
                </Button>
            </Stack>
            <div className={cls.content}>
                <Container size="md">
                    {children}
                </Container>
            </div>
        </Stack>
    )
}
