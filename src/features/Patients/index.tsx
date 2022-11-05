import { DataGrid, GridColDef, GridRowModel, GridValidRowModel, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';
import { BloodType, Patient } from '@prisma/client';
import React from 'react';
import toast from 'react-hot-toast';
import { Swatch } from '../../components/Swatch';
import { bloodTypeToLabel } from '../../constants/patient';
import { trpc } from '../../utils/trpc';
import { PatientRegister } from '../PatientRegister';

const columns: GridColDef[] = [
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
        field: 'email',
        headerName: 'Email',
        width: 150,
        editable: true,
    },
    {
        field: 'address',
        headerName: 'Address',
        width: 150,
        editable: true,
    },
    {
        field: 'bloodType',
        type: 'singleSelect',
        headerName: 'Blood type',
        valueOptions: Object.values(BloodType).map((value) => ({
            label: bloodTypeToLabel[value],
            value,
        })),
        valueFormatter: (params: GridValueFormatterParams<Patient['bloodType']>) => bloodTypeToLabel[params.value],
        width: 150,
        editable: true,
    }
];

export const Patients: React.FC = () => {
    const [state, setState] = React.useState<'list' | 'create'>('list');
    const { data } = trpc.patient.get.useQuery();
    const { mutateAsync: update } = trpc.patient.update.useMutation();

    const rows = React.useMemo(() => {
        return data ?? [];
    }, [data]);

    const processRowUpdate = React.useCallback(
        async (newRow: GridRowModel<Patient>) => {
            const promise = update({
                ...newRow,
            });
            const data = await toast.promise(promise, {
                success: 'Patient updated',
                error: 'Failed to update patient',
                loading: 'Updating patient...',
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
                <PatientRegister />
            )}
        </div>
    )
}