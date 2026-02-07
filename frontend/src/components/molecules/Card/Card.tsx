import { ReactNode, MouseEvent } from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
  CardActionArea,
  SxProps,
  Theme,
} from '@mui/material';

interface CardProps {
  title?: ReactNode;
  subheader?: ReactNode;
  avatar?: ReactNode;
  headerAction?: ReactNode;
  image?: string;
  imageHeight?: number;
  imageAlt?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  elevation?: number;
  sx?: SxProps<Theme>;
}

const Card = ({
  title,
  subheader,
  avatar,
  headerAction,
  image,
  imageHeight = 200,
  imageAlt,
  children,
  actions,
  onClick,
  elevation = 1,
  sx,
  ...props
}: CardProps) => {
  const content = (
    <>
      {(title || subheader || avatar) && (
        <CardHeader
          title={title}
          subheader={subheader}
          avatar={avatar}
          action={headerAction}
        />
      )}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt || (typeof title === 'string' ? title : '') || ''}
        />
      )}
      {children && <CardContent>{children}</CardContent>}
      {actions && <CardActions>{actions}</CardActions>}
    </>
  );

  return (
    <MuiCard elevation={elevation} sx={sx} {...props}>
      {onClick ? (
        <CardActionArea onClick={onClick}>{content}</CardActionArea>
      ) : (
        content
      )}
    </MuiCard>
  );
};

export default Card;
