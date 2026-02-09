/**
 * EventsPage
 *
 * Admin page for managing events with navigation to create/edit pages.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
  useGetEventsQuery,
  useDeleteEventMutation,
} from '../../../../store/api/eventsApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../../store';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface Event {
  id: string;
  title: string | LocalizedString;
  description?: string | LocalizedString;
  status: string;
  type?: string;
  startDate?: { _seconds: number } | string;
  endDate?: { _seconds: number } | string;
  location?: { name?: string; city?: string };
  churchName?: string | LocalizedString;
  registration?: { currentAttendees?: number };
  isFeatured?: boolean;
  isPublic?: boolean;
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Event | null>(null);

  const { data, isLoading } = useGetEventsQuery({ page, limit: 10, search: search || undefined });
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation();

  const events: Event[] = data?.data || [];
  const pagination = data?.pagination || {};

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  const formatDate = (date: { _seconds: number } | string | undefined): string => {
    if (!date) return '—';
    const d = typeof date === 'object' && '_seconds' in date
      ? new Date(date._seconds * 1000)
      : new Date(date);
    return d.toLocaleDateString(lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColors: Record<string, ChipColor> = {
    draft: 'default',
    published: 'success',
    cancelled: 'error',
    postponed: 'warning',
    completed: 'info',
  };

  const typeLabels: Record<string, string> = {
    conference: t('admin.events.types.conference', 'Conferencia'),
    special_event: t('admin.events.types.special_event', 'Evento Especial'),
    camp: t('admin.events.types.camp', 'Campamento'),
    workshop: t('admin.events.types.workshop', 'Taller'),
    retreat: t('admin.events.types.retreat', 'Retiro'),
    service: t('admin.events.types.service', 'Servicio'),
    concert: t('admin.events.types.concert', 'Concierto'),
    outreach: t('admin.events.types.outreach', 'Evangelismo'),
    meeting: t('admin.events.types.meeting', 'Reunión'),
    training: t('admin.events.types.training', 'Capacitación'),
  };

  const columns = [
    {
      field: 'title',
      label: t('admin.events.titleField', 'Título'),
      sortable: true,
      render: (row: Event) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getLocalizedText(row.title)}
          </Typography>
          {row.type && (
            <Typography variant="caption" color="textSecondary">
              {typeLabels[row.type] || row.type}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'church',
      label: t('admin.events.church', 'Iglesia'),
      render: (row: Event) => (
        <Typography variant="body2" color="textSecondary">
          {getLocalizedText(row.churchName)}
        </Typography>
      ),
    },
    {
      field: 'status',
      label: t('admin.events.status', 'Estado'),
      render: (row: Event) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={t(`admin.events.statuses.${row.status}`, row.status)}
            size="small"
            color={statusColors[row.status] || 'default'}
          />
          {row.isFeatured && (
            <Chip label={t('admin.events.featured', 'Destacado')} size="small" color="primary" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: 'startDate',
      label: t('admin.events.date', 'Fecha'),
      sortable: true,
      render: (row: Event) => (
        <Box>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {formatDate(row.startDate)}
          </Typography>
          {row.location?.name && (
            <Typography variant="caption" color="textSecondary">
              {row.location.name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'registrations',
      label: t('admin.events.registrations', 'Registros'),
      render: (row: Event) => (
        <Typography variant="body2">
          {row.registration?.currentAttendees || 0}
        </Typography>
      ),
    },
    {
      field: 'actions',
      label: '',
      align: 'right' as const,
      render: (row: Event) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 500 }}
            onClick={() => navigate(`/admin/events/${row.id}/edit`)}
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

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteEvent(deleteConfirm.id).unwrap();
        dispatch(showSuccess(t('admin.events.deleteSuccess', 'Evento eliminado exitosamente')));
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting event:', error);
        dispatch(showError(t('admin.events.deleteError', 'Error al eliminar el evento')));
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.events.pageTitle', 'Gestión de Eventos')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/events/create')}
        >
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
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.events.deleteTitle', '¿Eliminar evento?')}
        message={t(
          'admin.events.deleteMessage',
          `¿Estás seguro de que deseas eliminar "${getLocalizedText(deleteConfirm?.title)}"? Esta acción no se puede deshacer.`
        )}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default EventsPage;
