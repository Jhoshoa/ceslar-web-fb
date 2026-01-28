import React from 'react';
import PropTypes from 'prop-types';
import { Skeleton as MuiSkeleton } from '@mui/material';

const Skeleton = ({
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
  ...props
}) => (
  <MuiSkeleton
    variant={variant}
    width={width}
    height={height}
    animation={animation}
    {...props}
  />
);

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'rectangular', 'rounded', 'circular']),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  animation: PropTypes.oneOf(['pulse', 'wave', false]),
};

export default Skeleton;
