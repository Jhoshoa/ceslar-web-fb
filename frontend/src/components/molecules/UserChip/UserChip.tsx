import { Box } from '@mui/material';
import Avatar from '../../atoms/Avatar/Avatar';
import Typography from '../../atoms/Typography/Typography';
import Chip from '../../atoms/Chip/Chip';

type UserChipSize = 'small' | 'medium';

interface UserChipProps {
  name: string;
  email?: string;
  photoURL?: string;
  role?: string;
  onClick?: () => void;
  showRole?: boolean;
  size?: UserChipSize;
}

const UserChip = ({
  name,
  email,
  photoURL,
  role,
  onClick,
  showRole = true,
  size = 'medium',
}: UserChipProps) => {
  const avatarSize = size === 'small' ? 28 : 36;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
        p: 0.5,
        borderRadius: 1,
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
      }}
    >
      <Avatar
        src={photoURL}
        alt={name}
        sx={{ width: avatarSize, height: avatarSize }}
      >
        {name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
        {email && size !== 'small' && (
          <Typography variant="caption" color="textSecondary" noWrap>
            {email}
          </Typography>
        )}
      </Box>
      {showRole && role && (
        <Chip label={role} size="small" variant="outlined" sx={{ ml: 'auto' }} />
      )}
    </Box>
  );
};

export default UserChip;
