import { ReactNode } from 'react';
import { Container, Grid, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ChurchIcon from '@mui/icons-material/Church';
import EventIcon from '@mui/icons-material/Event';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery } from '../../../../store/api/usersApi';
import { useGetChurchesQuery } from '../../../../store/api/churchesApi';
import { useGetEventsQuery } from '../../../../store/api/eventsApi';
import { useGetSermonsQuery } from '../../../../store/api/sermonsApi';
import StatCard from '../../../molecules/StatCard/StatCard';
import Typography from '../../../atoms/Typography/Typography';

interface StatItem {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading: boolean;
}

interface QuickAction {
  label: string;
  path: string;
}

const DashboardPage = () => {
  const { t } = useTranslation();

  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({ limit: 1 });
  const { data: churchesData, isLoading: loadingChurches } = useGetChurchesQuery({ limit: 1 });
  const { data: eventsData, isLoading: loadingEvents } = useGetEventsQuery({ limit: 1 });
  const { data: sermonsData, isLoading: loadingSermons } = useGetSermonsQuery({ limit: 1 });

  const stats: StatItem[] = [
    {
      title: t('admin.stats.users', 'Usuarios'),
      value: usersData?.pagination?.total || 0,
      icon: <PeopleIcon />,
      color: 'primary.main',
      loading: loadingUsers,
    },
    {
      title: t('admin.stats.churches', 'Iglesias'),
      value: churchesData?.pagination?.total || 0,
      icon: <ChurchIcon />,
      color: 'secondary.main',
      loading: loadingChurches,
    },
    {
      title: t('admin.stats.events', 'Eventos'),
      value: eventsData?.pagination?.total || 0,
      icon: <EventIcon />,
      color: 'success.main',
      loading: loadingEvents,
    },
    {
      title: t('admin.stats.sermons', 'Sermones'),
      value: sermonsData?.pagination?.total || 0,
      icon: <LibraryBooksIcon />,
      color: 'info.main',
      loading: loadingSermons,
    },
  ];

  const quickActions: QuickAction[] = [
    { label: t('admin.actions.addChurch', 'Nueva Iglesia'), path: '/admin/churches' },
    { label: t('admin.actions.addEvent', 'Nuevo Evento'), path: '/admin/events' },
    { label: t('admin.actions.addSermon', 'Nuevo Sermón'), path: '/admin/sermons' },
    { label: t('admin.actions.viewPending', 'Solicitudes Pendientes'), path: '/admin/memberships' },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('admin.dashboard.title', 'Dashboard')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {t('admin.dashboard.quickActions', 'Acciones Rápidas')}
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid item xs={12} sm={6} md={3} key={action.path}>
              <Box
                component="a"
                href={action.path}
                sx={{
                  display: 'block',
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {action.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
