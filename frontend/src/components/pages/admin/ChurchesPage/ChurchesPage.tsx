/**
 * ChurchesPage - Admin
 *
 * Admin page for managing churches with proper CRUD operations.
 * Uses navigation to separate create/edit pages for better UX.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

import {
  useGetChurchesQuery,
  useDeleteChurchMutation,
} from '../../../../store/api/churchesApi';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import DataTable from '../../../organisms/DataTable/DataTable';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import type { AppDispatch } from '../../../../store';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface Church {
  id: string;
  name: string | LocalizedString;
  slug?: string;
  level: string;
  location?: {
    city?: string;
    country?: string;
  };
  country?: string;
  city?: string;
  status?: string;
  stats?: {
    memberCount?: number;
  };
}

const LEVEL_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
  headquarters: 'primary',
  country: 'secondary',
  department: 'info',
  province: 'warning',
  local: 'default',
};

const LEVEL_LABELS: Record<string, string> = {
  headquarters: 'Sede',
  country: 'País',
  department: 'Depto',
  province: 'Prov',
  local: 'Local',
};

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  suspended: 'error',
};

const ChurchesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Church | null>(null);

  const { data, isLoading } = useGetChurchesQuery({
    page,
    limit: 10,
    search: search || undefined,
  });

  const [deleteChurch, { isLoading: deleting }] = useDeleteChurchMutation();

  const churches: Church[] = data?.data || [];
  const pagination = data?.pagination || {};

  const getLocalizedName = (name: string | LocalizedString): string => {
    if (typeof name === 'string') return name;
    return name[lang] || name.es || '';
  };

  const handleCreate = () => {
    navigate('/admin/churches/create');
  };

  const handleEdit = (church: Church) => {
    navigate(`/admin/churches/${church.id}/edit`);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteChurch(deleteConfirm.id).unwrap();
        dispatch(showSuccess(t('admin.churches.deleteSuccess', 'Iglesia eliminada exitosamente')));
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting church:', error);
        dispatch(showError(t('admin.churches.deleteError', 'Error al eliminar la iglesia')));
      }
    }
  };

  const columns = [
    {
      field: 'name',
      label: t('admin.churches.name', 'Nombre'),
      sortable: true,
      render: (row: Church) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getLocalizedName(row.name)}
          </Typography>
          {row.slug && (
            <Typography variant="caption" color="textSecondary">
              /{row.slug}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'level',
      label: t('admin.churches.level', 'Nivel'),
      render: (row: Church) => (
        <Chip
          label={LEVEL_LABELS[row.level] || row.level}
          size="small"
          color={LEVEL_COLORS[row.level] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'location',
      label: t('admin.churches.location', 'Ubicación'),
      render: (row: Church) => {
        const city = row.location?.city || row.city;
        const country = row.location?.country || row.country;
        return (
          <Typography variant="body2" color="textSecondary">
            {[city, country].filter(Boolean).join(', ') || '—'}
          </Typography>
        );
      },
    },
    {
      field: 'status',
      label: t('admin.churches.status', 'Estado'),
      render: (row: Church) => (
        <Chip
          label={row.status || 'active'}
          size="small"
          color={STATUS_COLORS[row.status || 'active'] || 'default'}
        />
      ),
    },
    {
      field: 'stats',
      label: t('admin.churches.members', 'Miembros'),
      render: (row: Church) => (
        <Typography variant="body2">
          {row.stats?.memberCount || 0}
        </Typography>
      ),
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
            onClick={() => handleEdit(row)}
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('admin.churches.title', 'Gestión de Iglesias')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            {t('admin.churches.subtitle', 'Administra las iglesias de la red')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
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
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        emptyMessage={t('admin.churches.empty', 'No hay iglesias registradas')}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.churches.deleteTitle', '¿Eliminar iglesia?')}
        message={
          deleteConfirm
            ? t(
                'admin.churches.deleteMessage',
                `¿Estás seguro de que deseas eliminar "${getLocalizedName(deleteConfirm.name)}"? Esta acción no se puede deshacer.`
              )
            : ''
        }
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default ChurchesPage;
