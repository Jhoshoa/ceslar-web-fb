import React, { useState } from 'react';
import { Container, Grid, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetChurchesQuery } from '../../../../store/api/churchesApi';
import ChurchCard from '../../../organisms/ChurchCard/ChurchCard';
import SearchInput from '../../../molecules/SearchInput/SearchInput';
import Pagination from '../../../molecules/Pagination/Pagination';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';

const LEVELS = ['all', 'headquarters', 'country', 'department', 'province', 'local'];

const ChurchesPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');

  const { data, isLoading } = useGetChurchesQuery({
    page,
    limit: 12,
    search: search || undefined,
    level: level !== 'all' ? level : undefined,
  });

  const churches = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('churches.title', 'Nuestras Iglesias')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('churches.subtitle', 'Encuentra una iglesia cerca de ti')}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
          <SearchInput
            value={search}
            onSearch={(val) => { setSearch(val); setPage(1); }}
            placeholder={t('churches.search', 'Buscar iglesia...')}
          />
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('churches.level', 'Nivel')}</InputLabel>
          <Select
            value={level}
            label={t('churches.level', 'Nivel')}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l === 'all' ? t('common.all', 'Todos') : t(`church.level.${l}`, l)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : churches.map((church) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={church.id}>
                <ChurchCard church={church} />
              </Grid>
            ))}
      </Grid>

      {!isLoading && churches.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="textSecondary">
            {t('churches.empty', 'No se encontraron iglesias')}
          </Typography>
        </Box>
      )}

      <Pagination
        page={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        onChange={setPage}
        itemsPerPage={12}
      />
    </Container>
  );
};

export default ChurchesPage;
