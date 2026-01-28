import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../molecules/Card/Card';
import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import Chip from '../../atoms/Chip/Chip';

const SermonCard = ({ sermon, showActions = true }) => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const title = sermon.title?.[lang] || sermon.title?.es || sermon.title;
  const description = sermon.description?.[lang] || sermon.description?.es || sermon.description;
  const speaker = sermon.speaker?.name || sermon.speaker;

  return (
    <Card
      image={sermon.thumbnail || sermon.coverImage}
      imageHeight={180}
      imageAlt={title}
      elevation={2}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ flexGrow: 1 }}>
        {sermon.category && (
          <Chip label={sermon.category} size="small" sx={{ mb: 1 }} />
        )}

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>

        {speaker && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {speaker}
            </Typography>
          </Box>
        )}

        {description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: 1,
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

        {sermon.views !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="textSecondary">
              {sermon.views} {t('sermon.views', 'vistas')}
            </Typography>
          </Box>
        )}
      </Box>

      {showActions && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate(`/sermons/${sermon.id}`)}
            fullWidth
          >
            {t('sermon.watch', 'Ver Sermón')}
          </Button>
        </Box>
      )}
    </Card>
  );
};

SermonCard.propTypes = {
  sermon: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    thumbnail: PropTypes.string,
    coverImage: PropTypes.string,
    speaker: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    category: PropTypes.string,
    views: PropTypes.number,
  }).isRequired,
  showActions: PropTypes.bool,
};

export default SermonCard;
