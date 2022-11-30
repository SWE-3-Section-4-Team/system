import React from "react";
import clsx from "clsx";

import cls from './Table.module.scss';
import { MixIcon } from "@radix-ui/react-icons";
import { Text } from "../Typography";
import { Stack } from "../Stack";

interface Column<T> {
    key: keyof T;
    title: string;
    render?: (item: T) => React.ReactNode;
    width?: number;
    align?: 'left' | 'right' | 'center';
}

interface TableProps<T extends { id: string | number }> extends React.ComponentProps<'table'> {
    data: T[];
    columns: Column<T>[];
    footer?: React.ReactNode | false;
}

export const Table = <T extends { id: string | number }>({ data, columns, className, footer = true, ...props }: TableProps<T>) => {
    const showFooter = footer !== false;
    return (
        <div className={clsx(cls.root, className)}>
            <table {...props}>
                <thead>
                    <tr>
                        {
                            columns.map((column) => (
                                <th key={column.key as string} style={{ width: column.width }}>
                                    {column.title}
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((item) => (
                            <tr key={item.id as string}>
                                {
                                    columns.map((column) => (
                                        <td key={column.key as string} style={{ textAlign: column.align }}>
                                            {column.render ? column.render(item) : (item[column.key] as React.ReactNode)}
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            {data.length === 0 && (
                <Stack direction="column" alignItems="center" gap={8} className={cls.empty}>
                    <MixIcon width={24} height={24} />
                    <Text type="secondary" font={14}>No data</Text>
                </Stack>
            )}
            {showFooter ? (
                <div className={cls.footer}>
                    {typeof footer === 'boolean' ? (
                        <div className={cls.text}>
                            {data.length} items
                        </div>
                    ) : footer}
                </div>
            ) : null}
        </div>
    )
}