/**
 * CallToActionSection Organism
 *
 * A compelling call-to-action section encouraging visitors to take the next step.
 * Features an elegant design with gradient background and animated elements.
 */

import { Box, Container, Typography, Button, alpha, keyframes } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ChurchIcon from '@mui/icons-material/Church';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const CallToActionSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${navyColor} 0%, #0A1535 50%, #060D26 100%)`,
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(goldColor, 0.1)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(goldColor, 0.08)} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '1s',
        }}
      />

      {/* Cross pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          opacity: 0.05,
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <Box sx={{ width: 4, height: 80, bgcolor: goldColor, mx: 'auto' }} />
        <Box sx={{ width: 50, height: 4, bgcolor: goldColor, position: 'relative', top: -60 }} />
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
        {/* Label */}
        <Typography
          variant="overline"
          sx={{
            color: goldColor,
            letterSpacing: 4,
            fontWeight: 600,
            mb: 3,
            display: 'block',
          }}
        >
          {t('cta.label', 'ÚNETE A NOSOTROS')}
        </Typography>

        {/* Title */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2,
            mb: 3,
          }}
        >
          {t('cta.title', 'Forma Parte de Nuestra Familia')}
        </Typography>

        {/* Description */}
        <Typography
          variant="h6"
          sx={{
            color: alpha('#FFFFFF', 0.8),
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            mb: 5,
            lineHeight: 1.7,
            fontSize: { xs: '1rem', md: '1.15rem' },
          }}
        >
          {t(
            'cta.description',
            'Te invitamos a conocernos mejor. Visita una de nuestras congregaciones y descubre cómo Cristo puede transformar tu vida.'
          )}
        </Typography>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ChurchIcon />}
            onClick={() => navigate('/churches')}
            sx={{
              bgcolor: goldColor,
              color: '#FFFFFF',
              px: 4,
              py: 1.5,
              borderRadius: 50,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: `0 4px 20px ${alpha(goldColor, 0.4)}`,
              '&:hover': {
                bgcolor: '#C9A227',
                color: '#FFFFFF',
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 30px ${alpha(goldColor, 0.5)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {t('cta.findChurch', 'Encuentra una Iglesia')}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<GroupAddIcon />}
            onClick={() => navigate('/contact')}
            sx={{
              borderColor: alpha('#FFFFFF', 0.5),
              borderWidth: 2,
              color: '#FFFFFF',
              px: 4,
              py: 1.5,
              borderRadius: 50,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                borderColor: goldColor,
                borderWidth: 2,
                bgcolor: alpha(goldColor, 0.15),
                color: goldColor,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {t('cta.contact', 'Contáctanos')}
          </Button>
        </Box>

        {/* Bottom decorative line */}
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${alpha(goldColor, 0.5)})`,
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: goldColor,
              opacity: 0.6,
            }}
          />
          <Box
            sx={{
              width: 60,
              height: 1,
              background: `linear-gradient(90deg, ${alpha(goldColor, 0.5)}, transparent)`,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default CallToActionSection;
