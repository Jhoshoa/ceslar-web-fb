import { SvgIcon, SvgIconProps } from '@mui/material';

export type IconProps = SvgIconProps;

const Icon = ({ color = 'inherit', fontSize = 'medium', ...props }: IconProps) => (
  <SvgIcon color={color} fontSize={fontSize} {...props} />
);

export default Icon;
