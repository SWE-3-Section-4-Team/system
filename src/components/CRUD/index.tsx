import React, { type ReactNode } from "react";
import type { ZodType } from "zod";
import { z } from "zod";
import { Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from "../Button";
import { Stack } from "../Stack";

import cls from './CRUD.module.scss';
import { Modal } from "../Modal";
import { Select } from "../Select";
import { Input } from "../Input";
import { Text, Title } from "../Typography";
import { Table } from "../Table";
import { useFormik } from "formik";
import { zodToFormik } from "../../utils/zodToFormik";
import toast from "react-hot-toast";
import { UploadAvatar } from "../UploadAvatar";

interface Option {
    label: string;
    value: (string | number);
}

type TextField<T, Key extends keyof T = keyof T> = {
    type: 'text' | 'number' | 'email' | 'password';
    label: string;
    field: Key;
    placeholder?: string;
    schema: ZodType;
    mask?: string;
}

type ImageField<T, Key extends keyof T = keyof T> = {
    type: 'image';
    label: string;
    field: Key;
    schema: ZodType;
}

type SelectField<T, Key extends keyof T = keyof T> = {
    type: 'select';
    label: string;
    field: Key;
    placeholder?: string;
    schema: ZodType;
    valueOptions: Option[] | ((values: T) => Option[]);
}

export type Field<T> = TextField<T> | SelectField<T> | ImageField<T>;

export interface FieldDef<T, Key extends keyof T = keyof T> {
    field: Key;
    label: string;
    placeholder?: string;
    mask?: string;
    type?: 'text' | 'number' | 'select' | 'date' | 'image';
    schema: ZodType;
    width?: number;
    render?: (item: T) => ReactNode;
    valueOptions?: Option[] | ((values: T) => Option[]);
    valueFormatter?: (value: T[Key]) => ReactNode;
    notEditable?: boolean;
}

interface Props<T extends object, New extends object, Update extends object> {
    data?: T[];
    columns: FieldDef<T>[];
    getId?: (row: T) => string | number;
    fields: Field<New>[],
    newInitial: New;
    update: (data: Update) => Promise<T>;
    remove?: (id: string) => Promise<void>;
    invalidate: () => void;
    create: (data: New) => Promise<T>;
    title?: string;
    noEdit?: boolean;
}

const DEFAULT_GET_ID = (row: any) => row.id as string;

const renderValue = <T,>(row: T, field: FieldDef<T>['field'], column: FieldDef<T>): ReactNode => {
    const value = row[field];
    if (column.valueFormatter) {
        return column.valueFormatter(value);
    }

    if (column.type === 'select') {
        const options = typeof column.valueOptions === 'function' ? column.valueOptions(row) : column.valueOptions;
        const option = options?.find((option) => option.value === value);
        return (option?.label ?? value) as ReactNode;
    }

    if (column.type === 'date') {
        return new Date(value as string).toLocaleDateString('ru');
    }

    if (column.render) {
        return column.render(row);
    }

    return value as ReactNode;
}

export const CRUD = <T extends object, New extends object, Update extends object>({
    data,
    getId = DEFAULT_GET_ID,
    columns,
    title,
    fields,
    newInitial,
    invalidate,
    create,
    update,
    remove,
}: Props<T, New, Update>) => {
    const [modal, setModal] = React.useState(false);
    const [edit, setEdit] = React.useState<T | null>(null);

    React.useEffect(() => {
        if (!modal) {
            const timeout = setTimeout(() => {
                setEdit(null);
            }, 300);

            return () => clearTimeout(timeout);
        }
    }, [modal]);

    const rows = React.useMemo(() => {
        return data?.sort((a, b) => {
            const idA = getId(a);
            const idB = getId(b);
            if (idA > idB) {
                return 1;
            }
            if (idA < idB) {
                return -1;
            }
            return 0;
        }).map((row) => {
            const id = getId(row);

            return ({
                id,
                ...row,
                actions: (
                    <Stack gap={6}>
                        <Button
                            variant="default"
                            onClick={() => {
                                setEdit(row);
                                setModal(true);
                            }}
                            icon={<Pencil2Icon />}
                        />
                        {remove && <Button
                            variant="default"
                            onClick={() => {
                                remove(String(id)).then(() => invalidate())
                            }}
                            icon={<TrashIcon />}
                        />}
                    </Stack>
                )
            })
        }) || []
    }, [data, getId, remove, invalidate]);

    return (
        <>
            <Stack
                direction="column"
                className={cls.root}
                gap={12}
            >
                <Stack
                    direction="row"
                    gap={12}
                    justifyContent="space-between"
                >
                    <Title noMargin font={24}>
                        {title}
                    </Title>
                    <Button variant="primary" onClick={() => {
                        setModal(true);
                    }} icon={<PlusIcon />}>Add</Button>
                </Stack>
                <Table
                    columns={[
                        ...columns.map((column) => ({
                            key: column.field as keyof T,
                            title: column.label,
                            render: (row: T) => renderValue(row, column.field as keyof T, column),
                            width: column.width,
                        })),
                        {
                            key: 'actions',
                            title: 'Actions',
                            width: 100,
                        }
                    ]}
                    data={rows}
                />
            </Stack>
            <Modal
                open={modal}
                onOpenChange={setModal}
            >
                {edit ? (
                    <EditForm
                        columns={columns}
                        initialValues={edit}
                        close={() => setModal(false)}
                        update={update}
                        invalidate={invalidate}
                    />
                ) : (
                    <NewForm
                        fields={fields}
                        initialValues={newInitial}
                        close={() => setModal(false)}
                        create={create}
                        invalidate={invalidate}
                    />
                )}
            </Modal>
        </>
    )
}

interface EditFormProps<T, Update> {
    columns: FieldDef<T>[];
    initialValues: T;
    close: () => void;
    update: (data: Update) => Promise<T>;
    invalidate: () => void;
}

const EditForm = <T extends object, Update extends object>({
    columns,
    initialValues,
    update,
    invalidate,
    close,
}: EditFormProps<T, Update>) => {
    const fields = React.useMemo(() => columns.filter((column) => !column.notEditable), [columns]);

    const schema = React.useMemo(() => {
        return z.object({
            ...fields.reduce((acc, field) => {
                return {
                    ...acc,
                    [field.field]: field.schema,
                }
            }, {}),
        });
    }, [fields]);

    const { getFieldProps, touched, values, setFieldValue, errors, handleSubmit } = useFormik<Update>({
        initialValues: initialValues as unknown as Update,
        onSubmit: (values) => {
            const promise = update(values).then(() => {
                invalidate();
                close();
            });
            toast.promise(promise, {
                success: 'Updated',
                error: 'Error occured',
                loading: 'Updating...',
            });
        },
        validateOnBlur: true,
        validationSchema: zodToFormik(schema),
    });

    const getError = React.useCallback((name: keyof Update) => {
        return touched[name] && errors[name] ? errors[name] as string : undefined;
    }, [touched, errors]);

    return (
        <form onSubmit={handleSubmit}>
            <Stack
                direction="column"
                gap={12}
            >
                <Stack direction="column" gap={8}>
                    {
                        fields.map((field) => {
                            if (field.type === 'image') {
                                return (
                                    <UploadAvatar
                                        key={field.field as string}
                                        onChange={(value) => {
                                            setFieldValue(field.field as string, value);
                                        }}
                                    />
                                );
                            }
                            if (field.type === 'text') {
                                return (
                                    <Input
                                        key={field.field as string}
                                        {...getFieldProps(field.field)}
                                        type={field.type}
                                        label={field.label}
                                        placeholder={field.placeholder}
                                        mask={field.mask}
                                        error={getError(field.field as unknown as keyof Update)}
                                    />
                                )
                            }
                            if (field.type === 'select') {
                                return (
                                    <Stack key={field.field as string} direction="column" gap={8}>
                                        <Select
                                            value={String(values[field.field as unknown as keyof Update])}
                                            label={field.label}
                                            onValueChange={(value) => setFieldValue(field.field as string, value)}
                                            items={typeof field.valueOptions === 'function' ? field.valueOptions(values as unknown as T) : field.valueOptions ?? []}
                                        />
                                        <Text font={13} type="error">{getError(field.field as unknown as keyof Update)}</Text>
                                    </Stack>
                                );
                            }
                            return null;
                        })
                    }
                </Stack>
                <Button type="submit" fullWidth variant="primary">Save</Button>
                <Button onClick={close} fullWidth >Cancel</Button>
            </Stack>
        </form>
    )
}



interface NewFormProps<T extends object, New extends object, Update extends object> {
    fields: Field<New>[];
    initialValues: New;
    close: () => void;
    invalidate: Props<T, New, Update>['invalidate'];
    create: Props<T, New, Update>['create'];
}

const NewForm = <T extends object, New extends object, Update extends object>({
    initialValues,
    fields,
    close,
    create,
    invalidate,
}: NewFormProps<T, New, Update>) => {
    const schema = React.useMemo(() => {
        return z.object({
            ...fields.reduce((acc, field) => {
                return {
                    ...acc,
                    [field.field]: field.schema,
                }
            }, {}),
        });
    }, [fields]);

    const { getFieldProps, touched, values, setFieldValue, errors, handleSubmit } = useFormik<New>({
        initialValues,
        onSubmit: (values, { resetForm }) => {
            const promise = create(values).then(() => {
                invalidate();
                resetForm();
                close();
            });
            toast.promise(promise, {
                success: 'Created',
                error: 'Error occured',
                loading: 'Creating...',
            });
        },
        validateOnBlur: true,
        validationSchema: zodToFormik(schema),
    });

    const getError = React.useCallback((name: keyof New) => {
        return touched[name] && errors[name] ? errors[name] as string : undefined;
    }, [touched, errors]);

    return (
        <form onSubmit={handleSubmit}>
            <Stack
                direction="column"
                gap={12}
            >
                <Stack direction="column" gap={8}>
                    {
                        fields.map((field) => {
                            if (field.type === 'image') {
                                return (
                                    <UploadAvatar
                                        key={field.field as string}
                                        onChange={(value) => {
                                            setFieldValue(field.field as string, value);
                                        }}
                                    />
                                );
                            }
                            if (field.type === 'text' || field.type === 'number' || field.type === 'email' || field.type === 'password') {
                                return (
                                    <Input
                                        key={field.field as string}
                                        {...getFieldProps(field.field)}
                                        type={field.type}
                                        label={field.label}
                                        placeholder={field.placeholder}
                                        mask={field.mask}
                                        error={getError(field.field)}
                                    />
                                )
                            }
                            if (field.type === 'select') {
                                return (
                                    <Stack key={field.field as string} direction="column" gap={8}>
                                        <Select
                                            value={String(values[field.field])}
                                            label={field.label}
                                            onValueChange={(value) => setFieldValue(field.field as string, value)}
                                            items={typeof field.valueOptions === 'function' ? field.valueOptions(values) : field.valueOptions}
                                        />
                                        <Text font={13} type="error">{getError(field.field)}</Text>
                                    </Stack>
                                );
                            }
                            return null;
                        })
                    }
                </Stack>
                <Button type="submit" fullWidth variant="primary">Save</Button>
                <Button onClick={close} fullWidth >Cancel</Button>
            </Stack>
        </form>

    )
}
