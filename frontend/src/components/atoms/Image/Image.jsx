import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Skeleton } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

const Image = ({
  src,
  alt = '',
  width,
  height,
  objectFit = 'cover',
  borderRadius = 0,
  fallback,
  sx,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return fallback || (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius,
          ...sx,
        }}
      >
        <BrokenImageIcon color="disabled" />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width, height, borderRadius, overflow: 'hidden', ...sx }}>
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          display: loaded ? 'block' : 'none',
        }}
        loading="lazy"
        {...props}
      />
    </Box>
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fallback: PropTypes.node,
  sx: PropTypes.object,
};

export default Image;
