import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '../../../../store/api/eventsApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import FormField from '../../../molecules/FormField/FormField';

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, event: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', location: '' });

  const { data, isLoading } = useGetEventsQuery({ page, limit: 10, search: search || undefined });
  const [createEvent, { isLoading: creating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();

  const events = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      field: 'title',
      label: t('admin.events.title', 'Título'),
      sortable: true,
      render: (row) => {
        const title = row.title?.[lang] || row.title?.es || row.title;
        return <Typography variant="body2" sx={{ fontWeight: 500 }}>{title}</Typography>;
      },
    },
    {
      field: 'status',
      label: t('admin.events.status', 'Estado'),
      render: (row) => {
        const colors = { upcoming: 'info', ongoing: 'success', completed: 'default', cancelled: 'error' };
        return <Chip label={row.status} size="small" color={colors[row.status] || 'default'} />;
      },
    },
    {
      field: 'startDate',
      label: t('admin.events.date', 'Fecha'),
      sortable: true,
      render: (row) => {
        if (!row.startDate) return '—';
        const d = new Date(row.startDate._seconds ? row.startDate._seconds * 1000 : row.startDate);
        return <Typography variant="caption">{d.toLocaleDateString(lang)}</Typography>;
      },
    },
    {
      field: 'registrationCount',
      label: t('admin.events.registrations', 'Registros'),
      render: (row) => row.registrationCount || 0,
    },
    {
      field: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => openEdit(row)}>{t('common.edit', 'Editar')}</Typography>
          <Typography variant="body2" color="error" sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setDeleteConfirm(row)}>{t('common.delete', 'Eliminar')}</Typography>
        </Box>
      ),
    },
  ];

  const openEdit = (event) => {
    setForm({
      title: event.title?.[lang] || event.title?.es || '',
      description: event.description?.[lang] || event.description?.es || '',
      startDate: '',
      location: event.location?.name || '',
    });
    setDialog({ open: true, event });
  };

  const openCreate = () => {
    setForm({ title: '', description: '', startDate: '', location: '' });
    setDialog({ open: true, event: null });
  };

  const handleSave = async () => {
    const payload = {
      title: { [lang]: form.title },
      description: { [lang]: form.description },
      startDate: form.startDate || undefined,
      location: { name: form.location },
    };
    if (dialog.event) {
      await updateEvent({ id: dialog.event.id, ...payload });
    } else {
      await createEvent(payload);
    }
    setDialog({ open: false, event: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteEvent(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.events.pageTitle', 'Gestión de Eventos')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('admin.events.add', 'Nuevo Evento')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={events}
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
        onClose={() => setDialog({ open: false, event: null })}
        onSubmit={handleSave}
        title={dialog.event ? t('admin.events.edit', 'Editar Evento') : t('admin.events.add', 'Nuevo Evento')}
        loading={creating || updating}
      >
        <FormField label={t('admin.events.titleField', 'Título')} name="title" value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <FormField label={t('admin.events.description', 'Descripción')} name="description" value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} multiline rows={3} />
        <FormField label={t('admin.events.date', 'Fecha')} name="startDate" type="datetime-local" value={form.startDate}
          onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
        <FormField label={t('admin.events.location', 'Ubicación')} name="location" value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.events.deleteTitle', '¿Eliminar evento?')}
        message={t('admin.events.deleteMessage', 'Esta acción no se puede deshacer.')}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default EventsPage;
