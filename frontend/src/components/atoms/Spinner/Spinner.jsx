import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgress, Box } from '@mui/material';

const Spinner = ({
  size = 40,
  color = 'primary',
  centered = false,
  fullPage = false,
  ...props
}) => {
  const spinner = <CircularProgress size={size} color={color} {...props} />;

  if (fullPage) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {spinner}
      </Box>
    );
  }

  if (centered) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        {spinner}
      </Box>
    );
  }

  return spinner;
};

Spinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary', 'inherit']),
  centered: PropTypes.bool,
  fullPage: PropTypes.bool,
};

export default Spinner;
