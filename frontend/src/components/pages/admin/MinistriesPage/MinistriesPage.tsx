import { useState, ChangeEvent } from 'react';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import {
  useGetMinistriesQuery,
  useCreateMinistryMutation,
  useUpdateMinistryMutation,
  useDeleteMinistryMutation,
} from '../../../../store/api/ministriesApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import FormField from '../../../molecules/FormField/FormField';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface Ministry {
  id: string;
  name: string | LocalizedString;
  description?: string | LocalizedString;
  status?: string;
}

interface MinistryForm {
  name: string;
  description: string;
}

interface DialogState {
  open: boolean;
  ministry: Ministry | null;
}

const MinistriesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({ open: false, ministry: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Ministry | null>(null);
  const [form, setForm] = useState<MinistryForm>({ name: '', description: '' });

  const { data, isLoading } = useGetMinistriesQuery({ page, limit: 10, search: search || undefined });
  const [createMinistry, { isLoading: creating }] = useCreateMinistryMutation();
  const [updateMinistry, { isLoading: updating }] = useUpdateMinistryMutation();
  const [deleteMinistry, { isLoading: deleting }] = useDeleteMinistryMutation();

  const ministries: Ministry[] = data?.data || [];
  const pagination = data?.pagination || {};

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  const columns = [
    {
      field: 'name',
      label: t('admin.ministries.name', 'Nombre'),
      sortable: true,
      render: (row: Ministry) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{getLocalizedText(row.name)}</Typography>
      ),
    },
    {
      field: 'description',
      label: t('admin.ministries.description', 'Descripción'),
      render: (row: Ministry) => (
        <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 300 }}>
          {getLocalizedText(row.description) || '—'}
        </Typography>
      ),
    },
    {
      field: 'status',
      label: t('admin.ministries.status', 'Estado'),
      render: (row: Ministry) => row.status || 'active',
    },
    {
      field: 'actions',
      label: '',
      align: 'right' as const,
      render: (row: Ministry) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => openEdit(row)}>{t('common.edit', 'Editar')}</Typography>
          <Typography variant="body2" color="error" sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => setDeleteConfirm(row)}>{t('common.delete', 'Eliminar')}</Typography>
        </Box>
      ),
    },
  ];

  const openEdit = (ministry: Ministry) => {
    setForm({
      name: getLocalizedText(ministry.name),
      description: getLocalizedText(ministry.description),
    });
    setDialog({ open: true, ministry });
  };

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setDialog({ open: true, ministry: null });
  };

  const handleSave = async () => {
    const payload = {
      name: { [lang]: form.name },
      description: { [lang]: form.description },
    };
    if (dialog.ministry) {
      await updateMinistry({ id: dialog.ministry.id, ...payload });
    } else {
      await createMinistry(payload);
    }
    setDialog({ open: false, ministry: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMinistry(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleFormChange = (field: keyof MinistryForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.ministries.pageTitle', 'Gestión de Ministerios')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('admin.ministries.add', 'Nuevo Ministerio')}
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={ministries}
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
        onClose={() => setDialog({ open: false, ministry: null })}
        onSubmit={handleSave}
        title={dialog.ministry ? t('admin.ministries.edit', 'Editar Ministerio') : t('admin.ministries.add', 'Nuevo Ministerio')}
        loading={creating || updating}
      >
        <FormField label={t('admin.ministries.name', 'Nombre')} name="name" value={form.name}
          onChange={handleFormChange('name')} required />
        <FormField label={t('admin.ministries.description', 'Descripción')} name="description" value={form.description}
          onChange={handleFormChange('description')} multiline rows={3} />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.ministries.deleteTitle', '¿Eliminar ministerio?')}
        message={t('admin.ministries.deleteMessage', 'Esta acción no se puede deshacer.')}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default MinistriesPage;
