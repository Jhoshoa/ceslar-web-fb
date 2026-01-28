import React from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Typography, Button, alpha, keyframes } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
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
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const HeroSection = ({
  title,
  subtitle,
  description,
  backgroundImage,
  primaryAction,
  secondaryAction,
  height = '100vh',
  showDecorations = true,
}) => (
  <Box
    sx={{
      position: 'relative',
      minHeight: height,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      // Royal gradient background
      background: 'linear-gradient(135deg, #060D26 0%, #0D1B4C 30%, #1E3A8A 70%, #0D1B4C 100%)',
    }}
  >
    {/* Background image overlay */}
    {backgroundImage && (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
        }}
      />
    )}

    {/* Decorative elements */}
    {showDecorations && (
      <>
        {/* Gold accent lines */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '-5%',
            width: '40%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
            transform: 'rotate(-15deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '30%',
            right: '-5%',
            width: '40%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)',
            transform: 'rotate(-15deg)',
          }}
        />

        {/* Floating cross decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: 60,
            height: 60,
            opacity: 0.15,
            animation: `${float} 6s ease-in-out infinite`,
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '3px',
              height: '100%',
              bgcolor: '#D4AF37',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              width: '60%',
              height: '3px',
              bgcolor: '#D4AF37',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </Box>

        {/* Gradient orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </>
    )}

    {/* Content */}
    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 12 } }}>
      <Box
        sx={{
          maxWidth: 800,
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        {/* Crown decoration */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            animation: `${fadeInUp} 0.8s ease-out`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#D4AF37',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 1,
                background: 'linear-gradient(90deg, transparent, #D4AF37)',
              }}
            />
            <Typography
              variant="overline"
              sx={{
                color: '#D4AF37',
                letterSpacing: 4,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              BIENVENIDOS
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 1,
                background: 'linear-gradient(90deg, #D4AF37, transparent)',
              }}
            />
          </Box>
        </Box>

        {/* Title with gold shimmer effect */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
            lineHeight: 1.1,
            color: '#FFFFFF',
            mb: 2,
            animation: `${fadeInUp} 0.8s ease-out 0.2s both`,
            '& span': {
              background: 'linear-gradient(90deg, #D4AF37, #E5C76B, #D4AF37, #E5C76B, #D4AF37)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${shimmer} 3s linear infinite`,
            },
          }}
        >
          {title.split(' ').map((word, i) =>
            word.toLowerCase() === 'respuesta' ? (
              <span key={i}>{word} </span>
            ) : (
              `${word} `
            )
          )}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="h5"
            sx={{
              color: alpha('#FFFFFF', 0.9),
              fontWeight: 400,
              mb: 2,
              animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
              fontSize: { xs: '1.1rem', md: '1.35rem' },
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Description */}
        {description && (
          <Typography
            variant="body1"
            sx={{
              color: alpha('#FFFFFF', 0.7),
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              animation: `${fadeInUp} 0.8s ease-out 0.5s both`,
              lineHeight: 1.8,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
            animation: `${fadeInUp} 0.8s ease-out 0.6s both`,
          }}
        >
          {primaryAction && (
            <Button
              variant="contained"
              size="large"
              onClick={primaryAction.onClick}
              startIcon={<LocationOnIcon />}
              sx={{
                bgcolor: '#D4AF37',
                color: '#0D1B4C',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: '#E5C76B',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              size="large"
              onClick={secondaryAction.onClick}
              startIcon={<PlayArrowIcon />}
              sx={{
                color: '#FFFFFF',
                borderColor: alpha('#FFFFFF', 0.5),
                borderWidth: 2,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
                '&:hover': {
                  borderColor: '#FFFFFF',
                  borderWidth: 2,
                  bgcolor: alpha('#FFFFFF', 0.1),
                },
              }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Box>

        {/* Stats section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 4, sm: 8 },
            mt: 8,
            pt: 6,
            borderTop: `1px solid ${alpha('#D4AF37', 0.2)}`,
            animation: `${fadeInUp} 0.8s ease-out 0.8s both`,
          }}
        >
          {[
            { value: '50+', label: 'Iglesias' },
            { value: '10k+', label: 'Miembros' },
            { value: '5', label: 'Países' },
          ].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  color: '#D4AF37',
                  fontWeight: 700,
                  fontFamily: '"Playfair Display", serif',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: alpha('#FFFFFF', 0.7), mt: 0.5 }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>

    {/* Bottom wave decoration */}
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'linear-gradient(to top, rgba(248, 249, 252, 1), transparent)',
      }}
    />
  </Box>
);

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  backgroundImage: PropTypes.string,
  primaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showDecorations: PropTypes.bool,
};

export default HeroSection;
