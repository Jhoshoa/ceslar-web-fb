/**
 * ValueCard Molecule
 *
 * A card displaying a core value with icon and description.
 * Features subtle animations and hover effects.
 */

import { Box, Paper, Typography, alpha, keyframes } from '@mui/material';
import { ReactNode } from 'react';

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
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
  /** Card variant */
  variant?: 'default' | 'gold' | 'navy';
}

const ValueCard = ({
  icon,
  title,
  description,
  delay = 0,
  variant = 'default',
}: ValueCardProps) => {
  const goldColor = '#D4AF37';
  const navyColor = '#0D1B4C';

  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          bg: alpha(goldColor, 0.08),
          iconBg: goldColor,
          iconColor: 'white',
          border: alpha(goldColor, 0.2),
        };
      case 'navy':
        return {
          bg: alpha(navyColor, 0.05),
          iconBg: navyColor,
          iconColor: 'white',
          border: alpha(navyColor, 0.1),
        };
      default:
        return {
          bg: 'background.paper',
          iconBg: alpha(navyColor, 0.1),
          iconColor: navyColor,
          border: 'transparent',
        };
    }
  };

  const colors = getColors();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: '100%',
        borderRadius: 4,
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeIn 0.6s ease-out ${delay}s both`,
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(navyColor, 0.12)}`,
          '& .value-icon': {
            animation: `${float} 2s ease-in-out infinite`,
          },
        },
      }}
    >
      {/* Icon */}
      <Box
        className="value-icon"
        sx={{
          width: 64,
          height: 64,
          borderRadius: 3,
          bgcolor: colors.iconBg,
          color: colors.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          '& svg': {
            fontSize: 32,
          },
        }}
      >
        {icon}
      </Box>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: navyColor,
          mb: 1.5,
          fontFamily: '"Playfair Display", serif',
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.8,
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export default ValueCard;
