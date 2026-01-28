import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import {
  useGetSermonsQuery,
  useCreateSermonMutation,
  useUpdateSermonMutation,
  useDeleteSermonMutation,
} from '../../../../store/api/sermonsApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';

const SermonsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, sermon: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: '', speaker: '', videoUrl: '', category: '' });

  const { data, isLoading } = useGetSermonsQuery({ page, limit: 10, search: search || undefined });
  const [createSermon, { isLoading: creating }] = useCreateSermonMutation();
  const [updateSermon, { isLoading: updating }] = useUpdateSermonMutation();
  const [deleteSermon, { isLoading: deleting }] = useDeleteSermonMutation();

  const sermons = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      field: 'title',
      label: t('admin.sermons.titleField', 'Título'),
      sortable: true,
      render: (row) => {
        const title = row.title?.[lang] || row.title?.es || row.title;
        return <Typography variant="body2" sx={{ fontWeight: 500 }}>{title}</Typography>;
      },
    },
    {
      field: 'speaker',
      label: t('admin.sermons.speaker', 'Predicador'),
      render: (row) => row.speaker?.name || row.speaker || '—',
    },
    {
      field: 'category',
      label: t('admin.sermons.category', 'Categoría'),
      render: (row) => row.category || '—',
    },
    {
      field: 'views',
      label: t('admin.sermons.views', 'Vistas'),
      sortable: true,
      render: (row) => row.views || 0,
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

  const openEdit = (sermon) => {
    setForm({
      title: sermon.title?.[lang] || sermon.title?.es || '',
      speaker: sermon.speaker?.name || sermon.speaker || '',
      videoUrl: sermon.videoUrl || '',
      category: sermon.category || '',
    });
    setDialog({ open: true, sermon });
  };

  const openCreate = () => {
    setForm({ title: '', speaker: '', videoUrl: '', category: '' });
    setDialog({ open: true, sermon: null });
  };

  const handleSave = async () => {
    const payload = {
      title: { [lang]: form.title },
      speaker: { name: form.speaker },
      videoUrl: form.videoUrl,
      category: form.category,
    };
    if (dialog.sermon) {
      await updateSermon({ id: dialog.sermon.id, ...payload });
    } else {
      await createSermon(payload);
    }
    setDialog({ open: false, sermon: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteSermon(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.sermons.pageTitle', 'Gestión de Sermones')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('admin.sermons.add', 'Nuevo Sermón')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={sermons}
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
        onClose={() => setDialog({ open: false, sermon: null })}
        onSubmit={handleSave}
        title={dialog.sermon ? t('admin.sermons.edit', 'Editar Sermón') : t('admin.sermons.add', 'Nuevo Sermón')}
        loading={creating || updating}
      >
        <FormField label={t('admin.sermons.titleField', 'Título')} name="title" value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <FormField label={t('admin.sermons.speaker', 'Predicador')} name="speaker" value={form.speaker}
          onChange={(e) => setForm((p) => ({ ...p, speaker: e.target.value }))} />
        <FormField label={t('admin.sermons.videoUrl', 'URL del Video')} name="videoUrl" value={form.videoUrl}
          onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} />
        <FormField label={t('admin.sermons.category', 'Categoría')} name="category" value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.sermons.deleteTitle', '¿Eliminar sermón?')}
        message={t('admin.sermons.deleteMessage', 'Esta acción no se puede deshacer.')}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default SermonsPage;
