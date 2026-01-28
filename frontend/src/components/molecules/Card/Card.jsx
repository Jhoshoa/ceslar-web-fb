import React from 'react';
import PropTypes from 'prop-types';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
  CardActionArea,
} from '@mui/material';

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
}) => {
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
          alt={imageAlt || title || ''}
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

Card.propTypes = {
  title: PropTypes.node,
  subheader: PropTypes.node,
  avatar: PropTypes.node,
  headerAction: PropTypes.node,
  image: PropTypes.string,
  imageHeight: PropTypes.number,
  imageAlt: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
  onClick: PropTypes.func,
  elevation: PropTypes.number,
  sx: PropTypes.object,
};

export default Card;
