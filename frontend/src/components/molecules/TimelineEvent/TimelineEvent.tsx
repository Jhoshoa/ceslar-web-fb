/**
 * TimelineEvent Molecule
 *
 * A single event in a vertical timeline with year marker and content.
 * Features animated entrance and hover effects.
 */

import { Box, Typography, Paper, alpha, keyframes } from '@mui/material';
import { ReactNode } from 'react';

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
  }
`;

interface TimelineEventProps {
  /** Year or date of the event */
  year: string;
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Position in timeline (alternating) */
  position?: 'left' | 'right';
  /** Is this the first/highlighted event */
  highlight?: boolean;
  /** Animation delay in seconds */
  delay?: number;
}

const TimelineEvent = ({
  year,
  title,
  description,
  icon,
  position = 'left',
  highlight = false,
  delay = 0,
}: TimelineEventProps) => {
  const isLeft = position === 'left';
  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: isLeft ? 'row' : 'row-reverse' },
        alignItems: { xs: 'flex-start', md: 'center' },
        position: 'relative',
        mb: 6,
        animation: `${isLeft ? fadeInLeft : fadeInRight} 0.8s ease-out ${delay}s both`,
      }}
    >
      {/* Content Card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: isLeft ? 'flex-end' : 'flex-start' },
          pr: { xs: 0, md: isLeft ? 6 : 0 },
          pl: { xs: 0, md: isLeft ? 0 : 6 },
          ml: { xs: 6, md: 0 },
        }}
      >
        <Paper
          elevation={highlight ? 8 : 2}
          sx={{
            p: 3,
            maxWidth: 450,
            width: '100%',
            borderRadius: 3,
            border: highlight ? `2px solid ${goldColor}` : 'none',
            background: highlight
              ? `linear-gradient(135deg, ${alpha(goldColor, 0.05)} 0%, ${alpha(navyColor, 0.02)} 100%)`
              : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 40px ${alpha(navyColor, 0.15)}`,
            },
          }}
        >
          {/* Year Badge */}
          <Typography
            variant="overline"
            sx={{
              display: 'inline-block',
              bgcolor: highlight ? goldColor : alpha(navyColor, 0.1),
              color: highlight ? 'white' : navyColor,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.75rem',
              mb: 2,
            }}
          >
            {year}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: navyColor,
              mb: 1,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>
        </Paper>
      </Box>

      {/* Timeline Marker */}
      <Box
        sx={{
          position: { xs: 'absolute', md: 'relative' },
          left: { xs: 0, md: 'auto' },
          top: { xs: 0, md: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: highlight ? 24 : 16,
            height: highlight ? 24 : 16,
            borderRadius: '50%',
            bgcolor: highlight ? goldColor : navyColor,
            border: `3px solid ${highlight ? goldColor : 'white'}`,
            boxShadow: `0 0 0 4px ${alpha(highlight ? goldColor : navyColor, 0.2)}`,
            animation: highlight ? `${pulse} 2s ease-in-out infinite` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.7rem',
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Spacer for opposite side */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
        }}
      />
    </Box>
  );
};

export default TimelineEvent;
