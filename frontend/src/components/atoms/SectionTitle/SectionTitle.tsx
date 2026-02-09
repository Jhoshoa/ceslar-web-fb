/**
 * SectionTitle Atom
 *
 * An elegant section title with decorative elements and animations.
 * Used for major section headings throughout the site.
 */

import { Box, Typography, alpha, keyframes } from '@mui/material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const expandLine = keyframes`
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
`;

interface SectionTitleProps {
  /** The label/tag above the title */
  label?: string;
  /** Main title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Use light variant for dark backgrounds */
  light?: boolean;
  /** Animate on mount */
  animate?: boolean;
}

const SectionTitle = ({
  label,
  title,
  subtitle,
  align = 'center',
  light = false,
  animate = true,
}: SectionTitleProps) => {
  const textColor = light ? '#FFFFFF' : 'text.primary';
  const subtitleColor = light ? alpha('#FFFFFF', 0.7) : 'text.secondary';
  const goldColor = '#D4AF37';

  return (
    <Box
      sx={{
        textAlign: align,
        mb: 6,
        animation: animate ? `${fadeInUp} 0.8s ease-out` : 'none',
      }}
    >
      {/* Label with decorative lines */}
      {label && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'center' ? 'center' : `flex-${align === 'left' ? 'start' : 'end'}`,
            gap: 2,
            mb: 2,
          }}
        >
          {(align === 'center' || align === 'right') && (
            <Box
              sx={{
                height: 1,
                bgcolor: goldColor,
                animation: animate ? `${expandLine} 0.6s ease-out 0.3s both` : 'none',
                width: 60,
              }}
            />
          )}
          <Typography
            variant="overline"
            sx={{
              color: goldColor,
              letterSpacing: 3,
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {label}
          </Typography>
          {(align === 'center' || align === 'left') && (
            <Box
              sx={{
                height: 1,
                bgcolor: goldColor,
                animation: animate ? `${expandLine} 0.6s ease-out 0.3s both` : 'none',
                width: 60,
              }}
            />
          )}
        </Box>
      )}

      {/* Main title */}
      <Typography
        variant="h2"
        sx={{
          color: textColor,
          fontWeight: 700,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          lineHeight: 1.2,
          mb: subtitle ? 2 : 0,
          fontFamily: '"Playfair Display", serif',
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography
          variant="h6"
          sx={{
            color: subtitleColor,
            fontWeight: 400,
            maxWidth: 700,
            mx: align === 'center' ? 'auto' : 0,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionTitle;
