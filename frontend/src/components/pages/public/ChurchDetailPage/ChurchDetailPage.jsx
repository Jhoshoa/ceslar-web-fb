import React from 'react';
import { Container, Grid, Box, Chip as MuiChip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { useGetChurchBySlugQuery } from '../../../../store/api/churchesApi';
import { useGetEventsQuery } from '../../../../store/api/eventsApi';
import { useGetSermonsQuery } from '../../../../store/api/sermonsApi';
import EventCard from '../../../organisms/EventCard/EventCard';
import SermonCard from '../../../organisms/SermonCard/SermonCard';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';
import Avatar from '../../../atoms/Avatar/Avatar';

const ChurchDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data: church, isLoading } = useGetChurchBySlugQuery(slug);
  const { data: events } = useGetEventsQuery({ churchId: church?.id, limit: 3 }, { skip: !church?.id });
  const { data: sermons } = useGetSermonsQuery({ churchId: church?.id, limit: 3 }, { skip: !church?.id });

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="text" width="60%" />
      </Container>
    );
  }

  if (!church) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="textSecondary">
          {t('churches.notFound', 'Iglesia no encontrada')}
        </Typography>
      </Container>
    );
  }

  const name = church.name?.[lang] || church.name?.es || church.name;
  const description = church.description?.[lang] || church.description?.es || church.description;

  return (
    <Box>
      {/* Cover */}
      {church.coverImage && (
        <Box
          sx={{
            height: 300,
            backgroundImage: `url(${church.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {name}
              </Typography>
              <MuiChip label={t(`church.level.${church.level}`, church.level)} size="small" />
            </Box>

            {(church.location?.city || church.location?.country) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography color="textSecondary">
                  {[church.location.city, church.location.country].filter(Boolean).join(', ')}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
              <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography color="textSecondary">
                {church.stats?.memberCount || 0} {t('church.members', 'miembros')}
              </Typography>
            </Box>

            {description && (
              <Typography variant="body1" paragraph>
                {description}
              </Typography>
            )}

            {/* Schedule */}
            {church.schedule && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('church.schedule', 'Horarios')}
                </Typography>
                {Object.entries(church.schedule).map(([day, time]) => (
                  <Typography key={day} variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{day}:</strong> {time}
                  </Typography>
                ))}
              </Box>
            )}
          </Grid>

          {/* Leadership */}
          <Grid item xs={12} md={4}>
            {church.leadership?.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {t('church.leadership', 'Liderazgo')}
                </Typography>
                {church.leadership.map((leader) => (
                  <Box key={leader.userId || leader.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Avatar src={leader.photoURL} alt={leader.name}>
                      {leader.name?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {leader.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {leader.role}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Related Events */}
        {events?.data?.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {t('church.events', 'Eventos')}
            </Typography>
            <Grid container spacing={3}>
              {events.data.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Related Sermons */}
        {sermons?.data?.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              {t('church.sermons', 'Sermones')}
            </Typography>
            <Grid container spacing={3}>
              {sermons.data.map((sermon) => (
                <Grid item xs={12} sm={6} md={4} key={sermon.id}>
                  <SermonCard sermon={sermon} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ChurchDetailPage;
