import { Container, Grid, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetMinistriesQuery } from '../../../../store/api/ministriesApi';
import Card from '../../../molecules/Card/Card';
import Typography from '../../../atoms/Typography/Typography';
import Skeleton from '../../../atoms/Skeleton/Skeleton';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface Ministry {
  id: string;
  name: string | LocalizedString;
  description?: string | LocalizedString;
  coverImage?: string;
}

const MinistriesPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { data, isLoading } = useGetMinistriesQuery({});

  const ministries: Ministry[] = data?.data || [];

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('ministries.title', 'Ministerios')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('ministries.subtitle', 'Áreas de servicio en nuestra iglesia')}
      </Typography>

      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : ministries.map((ministry) => {
              const name = getLocalizedText(ministry.name);
              const description = getLocalizedText(ministry.description);

              return (
                <Grid item xs={12} sm={6} md={4} key={ministry.id}>
                  <Card
                    image={ministry.coverImage}
                    imageHeight={160}
                    imageAlt={name}
                    elevation={2}
                    sx={{ height: '100%' }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {description}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
      </Grid>

      {!isLoading && ministries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="textSecondary">
            {t('ministries.empty', 'No hay ministerios disponibles')}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MinistriesPage;
