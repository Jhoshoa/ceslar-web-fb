import React from 'react';
import { Container, Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Typography from '../../../atoms/Typography/Typography';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {t('about.title', 'Sobre Nosotros')}
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
        {t('about.subtitle', 'Conoce nuestra historia y misión')}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t('about.mission.title', 'Nuestra Misión')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('about.mission.description', 'Llevar el mensaje de Cristo a cada rincón de Sudamérica, formando discípulos y plantando iglesias que transformen comunidades.')}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t('about.vision.title', 'Nuestra Visión')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('about.vision.description', 'Ser una red de iglesias unidas, dinámicas y relevantes que impacten positivamente a la sociedad con el amor de Cristo.')}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t('about.history.title', 'Nuestra Historia')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('about.history.description', 'Fundada en Bolivia, Cristo Es La Respuesta ha crecido hasta convertirse en una red de iglesias presente en múltiples países de Sudamérica, con un compromiso firme con la predicación del evangelio y el servicio a la comunidad.')}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              {t('about.values.title', 'Nuestros Valores')}
            </Typography>
            {['Fe', 'Amor', 'Servicio', 'Unidad', 'Integridad'].map((value) => (
              <Typography key={value} variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                • {value}
              </Typography>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;
