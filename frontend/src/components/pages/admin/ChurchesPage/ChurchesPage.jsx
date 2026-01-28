import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import {
  useGetChurchesQuery,
  useCreateChurchMutation,
  useUpdateChurchMutation,
  useDeleteChurchMutation,
} from '../../../../store/api/churchesApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import FormField from '../../../molecules/FormField/FormField';

const LEVELS = ['headquarters', 'country', 'department', 'province', 'local'];

const ChurchesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, church: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', level: 'local', city: '', country: '' });

  const { data, isLoading } = useGetChurchesQuery({ page, limit: 10, search: search || undefined });
  const [createChurch, { isLoading: creating }] = useCreateChurchMutation();
  const [updateChurch, { isLoading: updating }] = useUpdateChurchMutation();
  const [deleteChurch, { isLoading: deleting }] = useDeleteChurchMutation();

  const churches = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      field: 'name',
      label: t('admin.churches.name', 'Nombre'),
      sortable: true,
      render: (row) => {
        const name = row.name?.[lang] || row.name?.es || row.name;
        return <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>;
      },
    },
    {
      field: 'level',
      label: t('admin.churches.level', 'Nivel'),
      render: (row) => <Chip label={row.level} size="small" variant="outlined" />,
    },
    {
      field: 'location',
      label: t('admin.churches.location', 'Ubicación'),
      render: (row) => (
        <Typography variant="body2" color="textSecondary">
          {[row.location?.city, row.location?.country].filter(Boolean).join(', ') || '—'}
        </Typography>
      ),
    },
    {
      field: 'stats',
      label: t('admin.churches.members', 'Miembros'),
      render: (row) => row.stats?.memberCount || 0,
    },
    {
      field: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => openEdit(row)}
          >
            {t('common.edit', 'Editar')}
          </Typography>
          <Typography
            variant="body2"
            color="error"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setDeleteConfirm(row)}
          >
            {t('common.delete', 'Eliminar')}
          </Typography>
        </Box>
      ),
    },
  ];

  const openEdit = (church) => {
    const name = church.name?.[lang] || church.name?.es || '';
    setForm({
      name,
      level: church.level || 'local',
      city: church.location?.city || '',
      country: church.location?.country || '',
    });
    setDialog({ open: true, church });
  };

  const openCreate = () => {
    setForm({ name: '', level: 'local', city: '', country: '' });
    setDialog({ open: true, church: null });
  };

  const handleSave = async () => {
    const payload = {
      name: { [lang]: form.name },
      level: form.level,
      location: { city: form.city, country: form.country },
    };

    if (dialog.church) {
      await updateChurch({ id: dialog.church.id, ...payload });
    } else {
      await createChurch(payload);
    }
    setDialog({ open: false, church: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteChurch(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.churches.title', 'Gestión de Iglesias')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('admin.churches.add', 'Nueva Iglesia')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={churches}
        loading={isLoading}
        page={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        onPageChange={setPage}
        searchValue={search}
        onSearch={(val) => { setSearch(val); setPage(1); }}
      />

      <FormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, church: null })}
        onSubmit={handleSave}
        title={dialog.church ? t('admin.churches.edit', 'Editar Iglesia') : t('admin.churches.add', 'Nueva Iglesia')}
        loading={creating || updating}
      >
        <FormField label={t('admin.churches.name', 'Nombre')} name="name" value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <FormField label={t('admin.churches.level', 'Nivel')} name="level" value={form.level}
          onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} />
        <FormField label={t('admin.churches.city', 'Ciudad')} name="city" value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
        <FormField label={t('admin.churches.country', 'País')} name="country" value={form.country}
          onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.churches.deleteTitle', '¿Eliminar iglesia?')}
        message={t('admin.churches.deleteMessage', 'Esta acción no se puede deshacer.')}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default ChurchesPage;
