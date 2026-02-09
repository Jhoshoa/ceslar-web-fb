/**
 * ValuesSection Organism
 *
 * Displays the church's core values in an elegant grid layout.
 * Features hover animations and a modern card design.
 */

import { Box, Container, Grid, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../../atoms/SectionTitle/SectionTitle';
import ValueCard from '../../molecules/ValueCard/ValueCard';

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ValuesSection = () => {
  const { t } = useTranslation();
  const goldColor = '#D4AF37';
  const blueColor = '#0F2167';
  const goldColorLight = '#F5ECD7';

  const values = [
    {
      icon: <FavoriteIcon />,
      title: t('about.values.faith.title', 'Fe'),
      description: t(
        'about.values.faith.description',
        'Confianza absoluta en Dios y en su palabra. Creemos en la Trinidad, en Jesucristo como manifestación física de Dios, y en la salvación por fe personal.'
      ),
    },
    {
      icon: <VolunteerActivismIcon />,
      title: t('about.values.love.title', 'Amor'),
      description: t(
        'about.values.love.description',
        'El amor de Dios como fundamento de todas nuestras acciones. Amamos a nuestro prójimo y servimos con compasión a toda la comunidad.'
      ),
    },
    {
      icon: <HandshakeIcon />,
      title: t('about.values.service.title', 'Servicio'),
      description: t(
        'about.values.service.description',
        'Siguiendo el ejemplo de Cristo, servimos a los demás con humildad y dedicación, buscando el bienestar espiritual y material de nuestra comunidad.'
      ),
    },
    {
      icon: <GroupsIcon />,
      title: t('about.values.unity.title', 'Unidad'),
      description: t(
        'about.values.unity.description',
        'Una red de iglesias unidas en propósito y visión, trabajando juntos para extender el reino de Dios en toda Sudamérica.'
      ),
    },
    {
      icon: <VerifiedUserIcon />,
      title: t('about.values.integrity.title', 'Integridad'),
      description: t(
        'about.values.integrity.description',
        'Vivimos con honestidad y transparencia, respetando las leyes civiles y manteniendo una conducta ejemplar en todas las áreas de nuestra vida.'
      ),
    },
    {
      icon: <AutoAwesomeIcon />,
      title: t('about.values.hope.title', 'Esperanza'),
      description: t(
        'about.values.hope.description',
        'Proclamamos la esperanza en la segunda venida de Cristo y el establecimiento de su reino de paz, inspirando a otros con esta promesa eterna.'
      ),
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${goldColorLight} 0%, #FFFFFF 100%)`,
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(blueColor, 0.04)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(goldColor, 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${alpha(blueColor, 0.03)} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionTitle
          label={t('about.values.label', 'LO QUE NOS DEFINE')}
          title={t('about.values.title', 'Nuestros Valores')}
          subtitle={t(
            'about.values.subtitle',
            'Principios fundamentales que guían nuestra fe y nuestras acciones'
          )}
        />

        <Grid container spacing={3}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ValueCard
                icon={value.icon}
                title={value.title}
                description={value.description}
                delay={index * 0.1}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ValuesSection;
