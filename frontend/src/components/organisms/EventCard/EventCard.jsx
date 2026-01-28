import React from 'react';
import PropTypes from 'prop-types';
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

const STATUS_COLORS = {
  upcoming: 'info',
  ongoing: 'success',
  completed: 'default',
  cancelled: 'error',
};

const EventCard = ({ event, showActions = true }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const title = event.title?.[lang] || event.title?.es || event.title;
  const description = event.description?.[lang] || event.description?.es || event.description;
  const eventDate = event.startDate
    ? new Date(event.startDate._seconds ? event.startDate._seconds * 1000 : event.startDate)
    : null;

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
          <Chip
            label={t(`event.status.${event.status}`, event.status)}
            size="small"
            color={STATUS_COLORS[event.status] || 'default'}
          />
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

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    coverImage: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    status: PropTypes.string,
    location: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  showActions: PropTypes.bool,
};

export default EventCard;
