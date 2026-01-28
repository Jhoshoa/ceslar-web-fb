import React, { useState } from 'react';
import { Container, Grid, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetSermonsQuery } from '../../../../store/api/sermonsApi';
import SermonCard from '../../../organisms/SermonCard/SermonCard';
import SearchInput from '../../../molecules/SearchInput/SearchInput';
import Pagination from '../../../molecules/Pagination/Pagination';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';

const SermonsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetSermonsQuery({
    page,
    limit: 9,
    search: search || undefined,
    sort: '-createdAt',
  });

  const sermons = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('sermons.title', 'Sermones')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('sermons.subtitle', 'Biblioteca de mensajes y enseñanzas')}
      </Typography>

      <Box sx={{ mb: 4, maxWidth: 400 }}>
        <SearchInput
          value={search}
          onSearch={(val) => { setSearch(val); setPage(1); }}
          placeholder={t('sermons.search', 'Buscar sermones...')}
        />
      </Box>

      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : sermons.map((sermon) => (
              <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                <SermonCard sermon={sermon} />
              </Grid>
            ))}
      </Grid>

      {!isLoading && sermons.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="textSecondary">
            {t('sermons.empty', 'No hay sermones disponibles')}
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

export default SermonsPage;
