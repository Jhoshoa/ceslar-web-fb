import React, { useState } from 'react';
import { Container, Grid, Box, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetEventsQuery } from '../../../../store/api/eventsApi';
import EventCard from '../../../organisms/EventCard/EventCard';
import SearchInput from '../../../molecules/SearchInput/SearchInput';
import Pagination from '../../../molecules/Pagination/Pagination';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';

const EventsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);

  const statusMap = ['upcoming', 'ongoing', 'completed'];
  const status = statusMap[tab];

  const { data, isLoading } = useGetEventsQuery({
    page,
    limit: 9,
    search: search || undefined,
    status,
  });

  const events = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('events.title', 'Eventos')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
          <SearchInput
            value={search}
            onSearch={(val) => { setSearch(val); setPage(1); }}
            placeholder={t('events.search', 'Buscar eventos...')}
          />
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }} sx={{ mb: 3 }}>
        <Tab label={t('events.upcoming', 'Próximos')} />
        <Tab label={t('events.ongoing', 'En curso')} />
        <Tab label={t('events.past', 'Pasados')} />
      </Tabs>

      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
      </Grid>

      {!isLoading && events.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="textSecondary">
            {t('events.empty', 'No hay eventos disponibles')}
          </Typography>
        </Box>
      )}

      <Pagination
        page={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        onChange={setPage}
        itemsPerPage={9}
      />
    </Container>
  );
};

export default EventsPage;
