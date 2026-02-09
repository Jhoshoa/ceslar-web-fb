/**
 * ValuesSection Organism
 *
 * Displays the church's core values in an elegant grid layout.
 * Features hover animations and a modern card design.
 */

import { Box, Container, Grid } from '@mui/material';
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

  const values = [
    {
      icon: <FavoriteIcon />,
      title: t('about.values.faith.title', 'Fe'),
      description: t(
        'about.values.faith.description',
        'Confianza absoluta en Dios y en su palabra. Creemos en la Trinidad, en Jesucristo como manifestación física de Dios, y en la salvación por fe personal.'
      ),
      variant: 'gold' as const,
    },
    {
      icon: <VolunteerActivismIcon />,
      title: t('about.values.love.title', 'Amor'),
      description: t(
        'about.values.love.description',
        'El amor de Dios como fundamento de todas nuestras acciones. Amamos a nuestro prójimo y servimos con compasión a toda la comunidad.'
      ),
      variant: 'default' as const,
    },
    {
      icon: <HandshakeIcon />,
      title: t('about.values.service.title', 'Servicio'),
      description: t(
        'about.values.service.description',
        'Siguiendo el ejemplo de Cristo, servimos a los demás con humildad y dedicación, buscando el bienestar espiritual y material de nuestra comunidad.'
      ),
      variant: 'default' as const,
    },
    {
      icon: <GroupsIcon />,
      title: t('about.values.unity.title', 'Unidad'),
      description: t(
        'about.values.unity.description',
        'Una red de iglesias unidas en propósito y visión, trabajando juntos para extender el reino de Dios en toda Sudamérica.'
      ),
      variant: 'gold' as const,
    },
    {
      icon: <VerifiedUserIcon />,
      title: t('about.values.integrity.title', 'Integridad'),
      description: t(
        'about.values.integrity.description',
        'Vivimos con honestidad y transparencia, respetando las leyes civiles y manteniendo una conducta ejemplar en todas las áreas de nuestra vida.'
      ),
      variant: 'default' as const,
    },
    {
      icon: <AutoAwesomeIcon />,
      title: t('about.values.hope.title', 'Esperanza'),
      description: t(
        'about.values.hope.description',
        'Proclamamos la esperanza en la segunda venida de Cristo y el establecimiento de su reino de paz, inspirando a otros con esta promesa eterna.'
      ),
      variant: 'default' as const,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: '#0D1B4C',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(30, 58, 138, 0.15) 0%, transparent 40%),
                           radial-gradient(circle at 60% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 40%)`,
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
          light
        />

        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ValueCard
                icon={value.icon}
                title={value.title}
                description={value.description}
                variant={value.variant}
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
