import { ReactNode } from 'react';
import { Paper, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Typography from '../../atoms/Typography/Typography';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: string;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'primary.main',
  loading = false,
}: StatCardProps) => (
  <Paper sx={{ p: 3, height: '100%' }} elevation={1}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {loading ? '—' : value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
            )}
            <Typography
              variant="caption"
              color={trend >= 0 ? 'success.main' : 'error.main'}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Typography>
            {trendLabel && (
              <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                {trendLabel}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      {icon && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}15`,
            color,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      )}
    </Box>
  </Paper>
);

export default StatCard;
