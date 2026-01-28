import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Checkbox,
} from '@mui/material';
import Skeleton from '../../atoms/Skeleton/Skeleton';
import Typography from '../../atoms/Typography/Typography';
import Pagination from '../../molecules/Pagination/Pagination';
import SearchInput from '../../molecules/SearchInput/SearchInput';

const DataTable = ({
  columns,
  rows,
  loading = false,
  sortBy,
  sortOrder = 'asc',
  onSort,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  searchValue,
  onSearch,
  selectable = false,
  selected = [],
  onSelectAll,
  onSelectRow,
  emptyMessage = 'No hay datos disponibles',
  stickyHeader = false,
  maxHeight,
}) => {
  const renderCell = (column, row) => {
    if (column.render) return column.render(row);
    return row[column.field];
  };

  const renderLoadingRows = () =>
    Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={idx}>
        {selectable && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={18} height={18} />
          </TableCell>
        )}
        {columns.map((col) => (
          <TableCell key={col.field}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <Box>
      {onSearch && (
        <Box sx={{ mb: 2 }}>
          <SearchInput value={searchValue} onSearch={onSearch} />
        </Box>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ maxHeight, border: 1, borderColor: 'divider' }}
      >
        <Table stickyHeader={stickyHeader} size="medium">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={onSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', ...col.headerSx }}
                  width={col.width}
                >
                  {col.sortable && onSort ? (
                    <TableSortLabel
                      active={sortBy === col.field}
                      direction={sortBy === col.field ? sortOrder : 'asc'}
                      onClick={() => onSort(col.field)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingRows()
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="textSecondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  selected={selectable && selected.includes(row.id)}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onChange={() => onSelectRow?.(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align || 'left'}>
                      {renderCell(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onChange={onPageChange}
        />
      )}
    </Box>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func,
      headerSx: PropTypes.object,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  onPageChange: PropTypes.func,
  searchValue: PropTypes.string,
  onSearch: PropTypes.func,
  selectable: PropTypes.bool,
  selected: PropTypes.array,
  onSelectAll: PropTypes.func,
  onSelectRow: PropTypes.func,
  emptyMessage: PropTypes.string,
  stickyHeader: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DataTable;
