import React from 'react';
import PropTypes from 'prop-types';
import { Box, Pagination as MuiPagination } from '@mui/material';
import Typography from '../../atoms/Typography/Typography';

const Pagination = ({
  page,
  totalPages,
  totalItems,
  onChange,
  size = 'medium',
  showInfo = true,
  itemsPerPage = 10,
}) => {
  if (totalPages <= 1) return null;

  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, totalItems);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
      {showInfo && totalItems > 0 && (
        <Typography variant="body2" color="textSecondary">
          {start}-{end} de {totalItems}
        </Typography>
      )}
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(_, newPage) => onChange(newPage)}
        size={size}
        color="primary"
        sx={{ ml: 'auto' }}
      />
    </Box>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showInfo: PropTypes.bool,
  itemsPerPage: PropTypes.number,
};

export default Pagination;
