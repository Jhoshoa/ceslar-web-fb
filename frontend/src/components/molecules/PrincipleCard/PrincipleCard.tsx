/**
 * PrincipleCard Molecule
 *
 * A card for displaying organizational principles (religious, moral, civil).
 * Features a collapsible list with smooth animations.
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  alpha,
  keyframes,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface PrincipleCardProps {
  /** Card title */
  title: string;
  /** List of principle items (strings) */
  items: string[];
  /** Primary color (hex value) */
  color?: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Start expanded */
  defaultExpanded?: boolean;
}

const PrincipleCard = ({
  title,
  items,
  color = '#D4AF37',
  delay = 0,
  defaultExpanded = true,
}: PrincipleCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        animation: `${fadeIn} 0.6s ease-out ${delay}s both`,
        '&:hover': {
          boxShadow: `0 8px 30px ${alpha(color, 0.15)}`,
        },
      }}
    >
      {/* Header */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
          borderBottom: expanded ? `1px solid ${alpha(color, 0.1)}` : 'none',
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontWeight: 700,
            color: color,
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {title}
        </Typography>

        {/* Expand Button */}
        <IconButton
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
            color: color,
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Principles List */}
      <Collapse in={expanded}>
        <List sx={{ p: 2 }}>
          {items.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(color, 0.05),
                },
                '&:last-child': {
                  mb: 0,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <CheckCircleOutlineIcon
                  sx={{
                    color: color,
                    fontSize: 20,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={item}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: { lineHeight: 1.6 },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

export default PrincipleCard;
