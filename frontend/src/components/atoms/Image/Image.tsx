import { useState, ReactNode } from 'react';
import { Box, Skeleton, SxProps, Theme } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: ObjectFit;
  borderRadius?: number | string;
  fallback?: ReactNode;
  sx?: SxProps<Theme>;
}

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
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
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

export default Image;
