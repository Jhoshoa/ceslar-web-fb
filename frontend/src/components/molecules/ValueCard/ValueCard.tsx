/**
 * ValueCard Molecule
 *
 * A card displaying a core value with icon and description.
 * Features subtle animations and hover effects.
 */

import { Box, Paper, Typography, alpha, keyframes } from '@mui/material';
import { ReactNode } from 'react';

const shimmer = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

interface ValueCardProps {
  /** Icon component */
  icon: ReactNode;
  /** Value title */
  title: string;
  /** Value description */
  description: string;
  /** Animation delay */
  delay?: number;
}

const ValueCard = ({
  icon,
  title,
  description,
  delay = 0,
}: ValueCardProps) => {
  const goldColor = '#D4AF37';
  const goldColorLight = '#F5ECD7';
  const blueColor = '#0F2167';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        bgcolor: alpha('#FFFFFF', 0.95),
        border: `1px solid ${alpha(goldColor, 0.15)}`,
        transition: 'all 0.3s ease',
        animation: `fadeIn 0.5s ease-out ${delay}s both`,
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(15px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${alpha(blueColor, 0.1)}`,
          borderColor: alpha(goldColor, 0.3),
          '& .value-icon': {
            animation: `${shimmer} 0.5s ease`,
            bgcolor: goldColor,
            color: '#FFFFFF',
          },
        },
      }}
    >
      {/* Icon + Title Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 1.5,
        }}
      >
        {/* Icon */}
        <Box
          className="value-icon"
          sx={{
            width: 44,
            height: 44,
            minWidth: 44,
            borderRadius: 2,
            bgcolor: goldColorLight,
            color: goldColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '& svg': {
              fontSize: 22,
            },
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: blueColor,
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.1rem',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: alpha(blueColor, 0.7),
          lineHeight: 1.7,
          fontSize: '0.85rem',
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export default ValueCard;
