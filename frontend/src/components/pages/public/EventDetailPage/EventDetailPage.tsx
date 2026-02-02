import { Container, Grid, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { useGetEventByIdQuery, useRegisterForEventMutation } from '../../../../store/api/eventsApi';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Skeleton from '../../../atoms/Skeleton/Skeleton';
import Chip from '../../../atoms/Chip/Chip';
import AlertMessage from '../../../molecules/AlertMessage/AlertMessage';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds?: number;
}

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data: event, isLoading, error } = useGetEventByIdQuery(id || '');
  const [register, { isLoading: registering, isSuccess, isError }] = useRegisterForEventMutation();

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  const parseDate = (date: string | FirestoreTimestamp | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if ((date as FirestoreTimestamp)._seconds) {
      return new Date((date as FirestoreTimestamp)._seconds * 1000);
    }
    return null;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" width="50%" height={48} />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="textSecondary">
          {t('events.notFound', 'Evento no encontrado')}
        </Typography>
      </Container>
    );
  }

  const title = getLocalizedText(event.title);
  const description = getLocalizedText(event.description);
  const startDate = parseDate(event.startDate);
  const endDate = parseDate(event.endDate);

  const handleRegister = () => {
    if (id) {
      register(id);
    }
  };

  return (
    <Box>
      {event.coverImage && (
        <Box
          sx={{
            height: 400,
            backgroundImage: `url(${event.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={t(`event.status.${event.status}`, event.status)} size="small" color="info" />
              {event.type && <Chip label={event.type} size="small" variant="outlined" />}
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
              {title}
            </Typography>

            {description && (
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {description}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {t('events.details', 'Detalles')}
              </Typography>

              {startDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('events.date', 'Fecha')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {startDate.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
              )}

              {startDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTimeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('events.time', 'Hora')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {startDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
                      {endDate && ` - ${endDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {event.location?.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('events.location', 'Ubicación')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {event.location.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              {event.maxAttendees && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PeopleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t('events.capacity', 'Capacidad')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {event.registrationCount || 0} / {event.maxAttendees}
                    </Typography>
                  </Box>
                </Box>
              )}

              <AlertMessage severity="success" show={isSuccess}>
                {t('events.registered', '¡Registrado exitosamente!')}
              </AlertMessage>
              <AlertMessage severity="error" show={isError}>
                {t('events.registerError', 'Error al registrarse')}
              </AlertMessage>

              {event.status === 'upcoming' && (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleRegister}
                  loading={registering}
                  disabled={isSuccess}
                >
                  {isSuccess
                    ? t('events.alreadyRegistered', 'Ya registrado')
                    : t('events.register', 'Registrarse')}
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventDetailPage;
