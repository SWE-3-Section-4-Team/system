import type { GridColDef, GridRowModel, GridValueFormatterParams, GridValueOptionsParams} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { Doctor } from '@prisma/client';
import React from 'react';
import toast from 'react-hot-toast';
import { Swatch } from '../../components/Swatch';
import { trpc } from '../../utils/trpc';
import { DoctorRegister } from '../DoctorRegister';

export const Doctors: React.FC = () => {
    const [state, setState] = React.useState<'list' | 'create'>('list');
    const { data } = trpc.doctor.get.useQuery();
    const { mutateAsync: update } = trpc.doctor.update.useMutation();
    const { data: all } = trpc.departments.getAllSerivces.useQuery();

    const columns = React.useMemo<GridColDef[]>(() => [
        { field: 'pin', headerName: 'PIN', width: 150 },
        {
            field: 'name',
            headerName: 'First name',
            width: 150,
            editable: true,
        },
        {
            field: 'surname',
            headerName: 'Surname',
            width: 150,
            editable: true,
        },
        {
            field: 'middlename',
            headerName: 'Middlename',
            width: 150,
            editable: true,
        },
        {
            field: 'departmentId',
            type: 'singleSelect',
            headerName: 'Department',
            valueOptions: (all || []).map(({ department }) => ({
                label: department.name,
                value: department.id,
            })),
            valueFormatter: (params: GridValueFormatterParams<Doctor['departmentId']>) => {
                const department = all?.map(({ department }) => department)?.find((department) => department.id === params.value);
                return department?.name || params.value;
            },
            width: 150,
            editable: true,
        },
        {
            field: 'serviceId',
            type: 'singleSelect',
            headerName: 'Service',
            valueOptions: (params: GridValueOptionsParams<Doctor>) => {
                const department = all?.find((department) => department.department.id === params.row?.departmentId);
                if (department) {
                    return department.services.map((service) => ({
                        label: service.name,
                        value: service.id,
                    }));
                }
                return [];
            },
            valueFormatter: (params: GridValueFormatterParams<Doctor['serviceId']>) => {
                const allServices = all?.map(({ services }) => services).flat();
                const service = allServices?.find((service) => service.id === params.value);
                return service?.name || params.value;
            },
            width: 150,
            editable: true,
        }
    ], [all]);

    const rows = React.useMemo(() => {
        return data ?? [];
    }, [data]);

    const processRowUpdate = React.useCallback(
        async (newRow: GridRowModel<Doctor>) => {
            const promise = update({
                ...newRow,
            });
            const data = await toast.promise(promise, {
                success: 'Doctor updated',
                error: 'Failed to update doctor',
                loading: 'Updating doctor...',
            });
            return {
                ...data,
            };
        }, [update]
    );

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        toast.error(error.message);
    }, []);

    return (
        <div>
            <div style={{
                maxWidth: 400,
            }}>
                <Swatch
                    value={state}
                    onChange={(value) => setState(value as 'list' | 'create')}
                    items={[
                        { value: 'list', label: 'All patients' },
                        { value: 'create', label: 'Create' },
                    ]}
                />
            </div>
            {state === 'list' && (
                <div style={{ height: 400, width: '100%', paddingTop: 32 }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        disableSelectionOnClick
                        experimentalFeatures={{ newEditingApi: true }}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                    />
                </div>
            )}
            {state === 'create' && (
                <DoctorRegister />
            )}
        </div>
    )
}