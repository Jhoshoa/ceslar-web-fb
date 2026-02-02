import { useState, ChangeEvent } from 'react';
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

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface Church {
  id: string;
  name: string | LocalizedString;
  level: string;
  location?: {
    city?: string;
    country?: string;
  };
  stats?: {
    memberCount?: number;
  };
}

interface ChurchForm {
  name: string;
  level: string;
  city: string;
  country: string;
}

interface DialogState {
  open: boolean;
  church: Church | null;
}

const ChurchesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<DialogState>({ open: false, church: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Church | null>(null);
  const [form, setForm] = useState<ChurchForm>({ name: '', level: 'local', city: '', country: '' });

  const { data, isLoading } = useGetChurchesQuery({ page, limit: 10, search: search || undefined });
  const [createChurch, { isLoading: creating }] = useCreateChurchMutation();
  const [updateChurch, { isLoading: updating }] = useUpdateChurchMutation();
  const [deleteChurch, { isLoading: deleting }] = useDeleteChurchMutation();

  const churches: Church[] = data?.data || [];
  const pagination = data?.pagination || {};

  const getLocalizedName = (name: string | LocalizedString): string => {
    if (typeof name === 'string') return name;
    return name[lang] || name.es || '';
  };

  const columns = [
    {
      field: 'name',
      label: t('admin.churches.name', 'Nombre'),
      sortable: true,
      render: (row: Church) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{getLocalizedName(row.name)}</Typography>
      ),
    },
    {
      field: 'level',
      label: t('admin.churches.level', 'Nivel'),
      render: (row: Church) => <Chip label={row.level} size="small" variant="outlined" />,
    },
    {
      field: 'location',
      label: t('admin.churches.location', 'Ubicación'),
      render: (row: Church) => (
        <Typography variant="body2" color="textSecondary">
          {[row.location?.city, row.location?.country].filter(Boolean).join(', ') || '—'}
        </Typography>
      ),
    },
    {
      field: 'stats',
      label: t('admin.churches.members', 'Miembros'),
      render: (row: Church) => row.stats?.memberCount || 0,
    },
    {
      field: 'actions',
      label: '',
      align: 'right' as const,
      render: (row: Church) => (
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

  const openEdit = (church: Church) => {
    const name = getLocalizedName(church.name);
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

  const handleFormChange = (field: keyof ChurchForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
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
          onChange={handleFormChange('name')} required />
        <FormField label={t('admin.churches.level', 'Nivel')} name="level" value={form.level}
          onChange={handleFormChange('level')} />
        <FormField label={t('admin.churches.city', 'Ciudad')} name="city" value={form.city}
          onChange={handleFormChange('city')} />
        <FormField label={t('admin.churches.country', 'País')} name="country" value={form.country}
          onChange={handleFormChange('country')} />
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
