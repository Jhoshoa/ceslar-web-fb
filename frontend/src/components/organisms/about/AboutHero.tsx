/**
 * AboutHero Organism
 *
 * Hero section specifically designed for the About page.
 * Features a split layout with content and decorative imagery.
 */

import { Box, Container, Typography, alpha, keyframes } from '@mui/material';
import { useTranslation } from 'react-i18next';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(2deg);
  }
`;

const AboutHero = () => {
  const { t } = useTranslation();
  const goldColor = '#D4AF37';
  const goldColorLight = '#F5ECD7';
  const blueColor = '#0F2167';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '70vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: goldColorLight,
      }}
    >
      {/* Decorative Cross Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 120,
          height: 120,
          opacity: 0.15,
          animation: `${float} 8s ease-in-out infinite`,
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 6,
            height: '100%',
            bgcolor: blueColor,
            transform: 'translate(-50%, -50%)',
            borderRadius: 1,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            width: '70%',
            height: 6,
            bgcolor: blueColor,
            transform: 'translate(-50%, -50%)',
            borderRadius: 1,
          }}
        />
      </Box>

      {/* Gradient Orbs - Blue */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(blueColor, 0.12)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(blueColor, 0.15)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Blue Accent Lines */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '-5%',
          width: '35%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(blueColor, 0.2)}, transparent)`,
          transform: 'rotate(-10deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '-5%',
          width: '30%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${alpha(blueColor, 0.2)}, transparent)`,
          transform: 'rotate(-10deg)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            maxWidth: 800,
            mx: 'auto',
            textAlign: 'center',
          }}
        >
          {/* Label */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              animation: `${fadeInUp} 0.8s ease-out`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 50,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${blueColor})`,
                }}
              />
              <Typography
                variant="overline"
                sx={{
                  color: blueColor,
                  letterSpacing: 4,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {t('about.hero.label', 'NUESTRA HISTORIA')}
              </Typography>
              <Box
                sx={{
                  width: 50,
                  height: 1,
                  background: `linear-gradient(90deg, ${blueColor}, transparent)`,
                }}
              />
            </Box>
          </Box>

          {/* Main Title */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
              lineHeight: 1.1,
              color: blueColor,
              mb: 3,
              animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
              '& .gold': {
                background: `linear-gradient(90deg, ${goldColor}, #E5C76B, ${goldColor}, #E5C76B, ${goldColor})`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmer} 4s linear infinite`,
              },
            }}
          >
            {t('about.hero.title', 'Cristo Es La')}{' '}
            <span className="gold">{t('about.hero.titleHighlight', 'Respuesta')}</span>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            sx={{
              color: alpha(blueColor, 0.8),
              fontWeight: 400,
              mb: 4,
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              maxWidth: 650,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {t(
              'about.hero.subtitle',
              'Desde 1969, llevando esperanza y transformando vidas en Bolivia y toda Sudamérica'
            )}
          </Typography>

          {/* Foundation Date Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              px: 5,
              py: 3,
              borderRadius: 4,
              border: `1px solid ${alpha(blueColor, 0.15)}`,
              background: `linear-gradient(135deg, ${alpha('#FFFFFF', 0.7)} 0%, ${alpha('#FFFFFF', 0.4)} 100%)`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 24px ${alpha(blueColor, 0.08)}`,
              animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: alpha(blueColor, 0.6),
                letterSpacing: 3,
                fontSize: '0.7rem',
              }}
            >
              {t('about.hero.foundedIn', 'Fundada en')}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: goldColor,
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                lineHeight: 1,
              }}
            >
              {t('about.hero.foundationDate', '24 de Septiembre')}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: blueColor,
                fontWeight: 700,
                fontFamily: '"Playfair Display", serif',
                lineHeight: 1,
              }}
            >
              1969
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${alpha(goldColor, 0.5)})`,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: alpha(blueColor, 0.7),
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                Santa Cruz, Bolivia
              </Typography>
              <Box
                sx={{
                  width: 20,
                  height: 1,
                  background: `linear-gradient(90deg, ${alpha(goldColor, 0.5)}, transparent)`,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>

    </Box>
  );
};

export default AboutHero;
