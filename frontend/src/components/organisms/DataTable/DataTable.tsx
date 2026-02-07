import { ReactNode, ChangeEvent } from 'react';
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
  SxProps,
  Theme,
} from '@mui/material';
import Skeleton from '../../atoms/Skeleton/Skeleton';
import Typography from '../../atoms/Typography/Typography';
import Pagination from '../../molecules/Pagination/Pagination';
import SearchInput from '../../molecules/SearchInput/SearchInput';

type SortOrder = 'asc' | 'desc';
type TableCellAlign = 'left' | 'center' | 'right';

export interface TableColumn<T = Record<string, unknown>> {
  field: string;
  label: string;
  sortable?: boolean;
  align?: TableCellAlign;
  width?: string | number;
  render?: (row: T) => ReactNode;
  headerSx?: SxProps<Theme>;
}

export interface DataTableRow {
  id?: string;
  [key: string]: unknown;
}

interface DataTableProps<T extends { id?: string }> {
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (field: string) => void;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectAll?: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectRow?: (id: string) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

function DataTable<T extends DataTableRow>({
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
}: DataTableProps<T>) {
  const renderCell = (column: TableColumn<T>, row: T): ReactNode => {
    if (column.render) return column.render(row);
    return row[column.field] as ReactNode;
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
                  selected={selectable && row.id ? selected.includes(row.id) : false}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={row.id ? selected.includes(row.id) : false}
                        onChange={() => row.id && onSelectRow?.(row.id)}
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
}

export default DataTable;
