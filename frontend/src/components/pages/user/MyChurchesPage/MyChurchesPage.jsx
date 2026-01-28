import React, { useState } from 'react';
import { Container, Grid, Box, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import {
  useGetMyMembershipsQuery,
  useLeaveChurchMutation,
} from '../../../../store/api/membershipsApi';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import Skeleton from '../../../atoms/Skeleton/Skeleton';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';

const MyChurchesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data, isLoading } = useGetMyMembershipsQuery();
  const [leaveChurch, { isLoading: leaving }] = useLeaveChurchMutation();

  const [confirmLeave, setConfirmLeave] = useState(null);

  const memberships = data?.data || [];

  const handleLeave = async () => {
    if (confirmLeave) {
      await leaveChurch(confirmLeave.churchId);
      setConfirmLeave(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('myChurches.title', 'Mis Iglesias')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} href="/churches">
          {t('myChurches.join', 'Unirse a Iglesia')}
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : memberships.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('myChurches.empty', 'No estás inscrito en ninguna iglesia')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {memberships.map((membership) => {
            const churchName = membership.churchName?.[lang] || membership.churchName?.es || membership.churchName;
            return (
              <Grid item xs={12} key={membership.churchId}>
                <Paper elevation={1} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {churchName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={t(`roles.${membership.role}`, membership.role)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={t(`membership.status.${membership.status}`, membership.status)}
                        size="small"
                        color={membership.status === 'active' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setConfirmLeave(membership)}
                  >
                    {t('myChurches.leave', 'Salir')}
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ConfirmDialog
        open={!!confirmLeave}
        onClose={() => setConfirmLeave(null)}
        onConfirm={handleLeave}
        title={t('myChurches.leaveConfirm.title', '¿Salir de la iglesia?')}
        message={t('myChurches.leaveConfirm.message', 'Perderás tu membresía y rol en esta iglesia.')}
        confirmLabel={t('myChurches.leaveConfirm.confirm', 'Sí, salir')}
        loading={leaving}
        destructive
      />
    </Container>
  );
};

export default MyChurchesPage;
