import React from 'react';
import PropTypes from 'prop-types';
import { Box, CardActions } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import ChurchIcon from '@mui/icons-material/Church';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../molecules/Card/Card';
import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import Chip from '../../atoms/Chip/Chip';

const LEVEL_COLORS = {
  headquarters: 'error',
  country: 'warning',
  department: 'info',
  province: 'secondary',
  local: 'default',
};

const ChurchCard = ({ church, showActions = true }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const name = church.name?.[lang] || church.name?.es || church.name;
  const city = church.location?.city;
  const country = church.location?.country;
  const memberCount = church.stats?.memberCount || 0;

  return (
    <Card
      image={church.coverImage}
      imageHeight={160}
      imageAlt={name}
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {name}
          </Typography>
          <Chip
            label={t(`church.level.${church.level}`, church.level)}
            size="small"
            color={LEVEL_COLORS[church.level] || 'default'}
          />
        </Box>

        {(city || country) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {[city, country].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="textSecondary">
            {memberCount} {t('church.members', 'miembros')}
          </Typography>
        </Box>
      </Box>

      {showActions && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChurchIcon />}
            onClick={() => navigate(`/churches/${church.slug || church.id}`)}
            fullWidth
          >
            {t('church.visit', 'Visitar')}
          </Button>
        </Box>
      )}
    </Card>
  );
};

ChurchCard.propTypes = {
  church: PropTypes.shape({
    id: PropTypes.string,
    slug: PropTypes.string,
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    level: PropTypes.string,
    coverImage: PropTypes.string,
    location: PropTypes.shape({
      city: PropTypes.string,
      country: PropTypes.string,
    }),
    stats: PropTypes.shape({
      memberCount: PropTypes.number,
    }),
  }).isRequired,
  showActions: PropTypes.bool,
};

export default ChurchCard;
