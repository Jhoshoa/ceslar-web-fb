import React, { useState } from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import {
  useGetPendingMembershipsQuery,
  useApproveMembershipMutation,
  useRejectMembershipMutation,
} from '../../../../store/api/membershipsApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Avatar from '../../../atoms/Avatar/Avatar';
import Chip from '../../../atoms/Chip/Chip';

const MembershipsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [page, setPage] = useState(1);
  const [rejectConfirm, setRejectConfirm] = useState(null);

  const { data, isLoading } = useGetPendingMembershipsQuery({ page, limit: 10 });
  const [approve, { isLoading: approving }] = useApproveMembershipMutation();
  const [reject, { isLoading: rejecting }] = useRejectMembershipMutation();

  const memberships = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      field: 'user',
      label: t('admin.memberships.user', 'Usuario'),
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={row.userPhotoURL} sx={{ width: 32, height: 32 }}>
            {row.userName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.userName}</Typography>
            <Typography variant="caption" color="textSecondary">{row.userEmail}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'church',
      label: t('admin.memberships.church', 'Iglesia'),
      render: (row) => {
        const name = row.churchName?.[lang] || row.churchName?.es || row.churchName;
        return <Typography variant="body2">{name}</Typography>;
      },
    },
    {
      field: 'requestedRole',
      label: t('admin.memberships.role', 'Rol Solicitado'),
      render: (row) => <Chip label={row.requestedRole || 'member'} size="small" variant="outlined" />,
    },
    {
      field: 'requestedAt',
      label: t('admin.memberships.date', 'Fecha'),
      render: (row) => {
        if (!row.requestedAt) return '—';
        const d = new Date(row.requestedAt._seconds ? row.requestedAt._seconds * 1000 : row.requestedAt);
        return <Typography variant="caption">{d.toLocaleDateString(lang)}</Typography>;
      },
    },
    {
      field: 'actions',
      label: t('admin.memberships.actions', 'Acciones'),
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckIcon />}
            onClick={() => approve({ membershipId: row.id, churchId: row.churchId })}
            loading={approving}
          >
            {t('admin.memberships.approve', 'Aprobar')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<CloseIcon />}
            onClick={() => setRejectConfirm(row)}
          >
            {t('admin.memberships.reject', 'Rechazar')}
          </Button>
        </Box>
      ),
    },
  ];

  const handleReject = async () => {
    if (rejectConfirm) {
      await reject({ membershipId: rejectConfirm.id, churchId: rejectConfirm.churchId });
      setRejectConfirm(null);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('admin.memberships.pageTitle', 'Solicitudes de Membresía')}
      </Typography>

      <DataTable
        columns={columns}
        rows={memberships}
        loading={isLoading}
        page={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        onPageChange={setPage}
        emptyMessage={t('admin.memberships.empty', 'No hay solicitudes pendientes')}
      />

      <ConfirmDialog
        open={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={handleReject}
        title={t('admin.memberships.rejectTitle', '¿Rechazar solicitud?')}
        message={t('admin.memberships.rejectMessage', 'El usuario será notificado del rechazo.')}
        loading={rejecting}
        destructive
      />
    </Container>
  );
};

export default MembershipsPage;
