import { Box } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../molecules/Card/Card';
import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import Chip from '../../atoms/Chip/Chip';

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<EventStatus, ChipColor> = {
  upcoming: 'info',
  ongoing: 'success',
  completed: 'default',
  cancelled: 'error',
};

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

interface EventLocation {
  name?: string;
}

interface EventData {
  id?: string;
  title: string | LocalizedString;
  description?: string | LocalizedString;
  coverImage?: string;
  startDate?: string | Date | FirestoreTimestamp;
  status?: EventStatus;
  location?: EventLocation;
}

interface EventCardProps {
  event: EventData;
  showActions?: boolean;
}

const EventCard = ({ event, showActions = true }: EventCardProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const title = typeof event.title === 'object'
    ? (event.title[lang] || event.title.es || '')
    : event.title;

  const description = typeof event.description === 'object'
    ? (event.description[lang] || event.description.es || '')
    : event.description;

  const getEventDate = (): Date | null => {
    if (!event.startDate) return null;
    if (typeof event.startDate === 'string') return new Date(event.startDate);
    if (event.startDate instanceof Date) return event.startDate;
    if ('_seconds' in event.startDate) return new Date(event.startDate._seconds * 1000);
    return null;
  };

  const eventDate = getEventDate();

  return (
    <Card
      image={event.coverImage}
      imageHeight={180}
      imageAlt={title}
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {event.status && (
            <Chip
              label={t(`event.status.${event.status}`, event.status)}
              size="small"
              color={STATUS_COLORS[event.status] || 'default'}
            />
          )}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {description}
          </Typography>
        )}

        {eventDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {eventDate.toLocaleDateString(lang)}
            </Typography>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {eventDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        )}

        {event.location?.name && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {event.location.name}
            </Typography>
          </Box>
        )}
      </Box>

      {showActions && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/events/${event.id}`)}
            fullWidth
          >
            {t('event.details', 'Ver Detalles')}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default EventCard;
