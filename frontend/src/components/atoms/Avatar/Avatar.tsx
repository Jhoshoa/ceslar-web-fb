import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

export interface AvatarProps extends MuiAvatarProps {
  size?: number;
}

const Avatar = ({
  size = 40,
  sx,
  ...props
}: AvatarProps) => (
  <MuiAvatar
    sx={{ width: size, height: size, ...sx }}
    {...props}
  />
);

export default Avatar;
