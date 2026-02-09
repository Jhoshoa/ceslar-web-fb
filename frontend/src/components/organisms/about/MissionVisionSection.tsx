/**
 * MissionVisionSection Organism
 *
 * Displays the church's mission and vision in an elegant split layout.
 * Features large typography and subtle animations.
 */

import { Box, Container, Grid, Typography, alpha, keyframes } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import VisibilityIcon from '@mui/icons-material/Visibility';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MissionVisionSection = () => {
  const { t } = useTranslation();
  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  const cards = [
    {
      icon: <TrackChangesIcon />,
      label: t('about.mission.label', 'NUESTRA MISIÓN'),
      title: t('about.mission.title', 'Misión'),
      content: t(
        'about.mission.content',
        'Restaurar a las personas a la fe de los padres apostólicos, instruyendo a los creyentes en la paz, el amor de Dios, la fraternidad y el respeto al prójimo.'
      ),
      color: goldColor,
      delay: 0,
    },
    {
      icon: <VisibilityIcon />,
      label: t('about.vision.label', 'NUESTRA VISIÓN'),
      title: t('about.vision.title', 'Visión'),
      content: t(
        'about.vision.content',
        'Ser una red de iglesias unidas que impacte positivamente a la sociedad, combinando la salvación eterna con una vida cristiana digna en el presente, transformando comunidades enteras con el amor de Cristo.'
      ),
      color: navyColor,
      delay: 0.2,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, #F8F9FC 0%, #FFFFFF 50%, #F8F9FC 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: `1px solid ${alpha(goldColor, 0.1)}`,
          display: { xs: 'none', lg: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          border: `1px solid ${alpha(navyColor, 0.08)}`,
          display: { xs: 'none', lg: 'block' },
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {cards.map((card, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 4, md: 6 },
                  borderRadius: 4,
                  background: index === 0
                    ? `linear-gradient(135deg, ${alpha(card.color, 0.08)} 0%, ${alpha(card.color, 0.02)} 100%)`
                    : `linear-gradient(135deg, ${alpha(card.color, 0.05)} 0%, ${alpha(card.color, 0.01)} 100%)`,
                  border: `1px solid ${alpha(card.color, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `${fadeIn} 0.8s ease-out ${card.delay}s both`,
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 60px ${alpha(card.color, 0.15)}`,
                  },
                }}
              >
                {/* Large background number */}
                <Typography
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -10,
                    fontSize: '180px',
                    fontWeight: 900,
                    color: alpha(card.color, 0.04),
                    fontFamily: '"Playfair Display", serif',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {index + 1}
                </Typography>

                {/* Icon */}
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    bgcolor: card.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4,
                    '& svg': {
                      fontSize: 36,
                    },
                  }}
                >
                  {card.icon}
                </Box>

                {/* Label */}
                <Typography
                  variant="overline"
                  sx={{
                    color: card.color,
                    letterSpacing: 3,
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  {card.label}
                </Typography>

                {/* Title */}
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 700,
                    color: navyColor,
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  {card.title}
                </Typography>

                {/* Content */}
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.9,
                    fontSize: '1.1rem',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {card.content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MissionVisionSection;
