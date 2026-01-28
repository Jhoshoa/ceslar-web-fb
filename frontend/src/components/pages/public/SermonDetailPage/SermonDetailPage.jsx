import React from 'react';
import { Container, Grid, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGetSermonByIdQuery } from '../../../../store/api/sermonsApi';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';
import Chip from '../../../atoms/Chip/Chip';

const SermonDetailPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data: sermon, isLoading } = useGetSermonByIdQuery(id);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" width="50%" height={48} />
      </Container>
    );
  }

  if (!sermon) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h5" color="textSecondary">
          {t('sermons.notFound', 'Sermón no encontrado')}
        </Typography>
      </Container>
    );
  }

  const title = sermon.title?.[lang] || sermon.title?.es || sermon.title;
  const description = sermon.description?.[lang] || sermon.description?.es || sermon.description;
  const speaker = sermon.speaker?.name || sermon.speaker;
  const createdAt = sermon.createdAt
    ? new Date(sermon.createdAt._seconds ? sermon.createdAt._seconds * 1000 : sermon.createdAt)
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Video Player Placeholder */}
          {sermon.videoUrl ? (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3,
              }}
            >
              <iframe
                src={sermon.videoUrl}
                title={title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allowFullScreen
              />
            </Box>
          ) : sermon.thumbnail && (
            <Box
              component="img"
              src={sermon.thumbnail}
              alt={title}
              sx={{ width: '100%', borderRadius: 2, mb: 3 }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {sermon.category && <Chip label={sermon.category} size="small" />}
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            {speaker && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">{speaker}</Typography>
              </Box>
            )}
            {createdAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {createdAt.toLocaleDateString(lang)}
                </Typography>
              </Box>
            )}
            {sermon.views !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  {sermon.views} {t('sermon.views', 'vistas')}
                </Typography>
              </Box>
            )}
          </Box>

          {description && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {description}
            </Typography>
          )}

          {/* Scripture References */}
          {sermon.scriptureReferences?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('sermon.scriptures', 'Referencias Bíblicas')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {sermon.scriptureReferences.map((ref) => (
                  <Chip key={ref} label={ref} variant="outlined" size="small" />
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Audio Player */}
          {sermon.audioUrl && (
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('sermon.audio', 'Audio')}
              </Typography>
              <audio controls style={{ width: '100%' }}>
                <source src={sermon.audioUrl} />
              </audio>
            </Paper>
          )}

          {/* Notes / Downloads */}
          {sermon.notesUrl && (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('sermon.notes', 'Notas')}
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href={sermon.notesUrl}
                target="_blank"
                rel="noopener"
                sx={{ color: 'primary.main' }}
              >
                {t('sermon.downloadNotes', 'Descargar notas')}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SermonDetailPage;
