import { useState } from 'react';
import { Container, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '../../../../store/api/usersApi';
import DataTable from '../../../organisms/DataTable/DataTable';
import Typography from '../../../atoms/Typography/Typography';
import Chip from '../../../atoms/Chip/Chip';
import Avatar from '../../../atoms/Avatar/Avatar';
import FormDialog from '../../../organisms/FormDialog/FormDialog';

interface User {
  id: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  systemRole: string;
  status?: string;
  createdAt?: { _seconds: number } | string;
}

interface Column {
  field: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (row: User) => React.ReactNode;
}

const ROLES = ['system_admin', 'user'];

const UsersPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter || undefined,
    sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`,
  });

  const [updateRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();

  const users: User[] = data?.data || [];
  const pagination = data?.pagination || {};

  const columns: Column[] = [
    {
      field: 'displayName',
      label: t('admin.users.name', 'Nombre'),
      sortable: true,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={row.photoURL} sx={{ width: 32, height: 32 }}>
            {row.displayName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.displayName}</Typography>
            <Typography variant="caption" color="textSecondary">{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'systemRole',
      label: t('admin.users.role', 'Rol'),
      sortable: true,
      render: (row) => (
        <Chip
          label={row.systemRole}
          size="small"
          color={row.systemRole === 'system_admin' ? 'error' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      label: t('admin.users.status', 'Estado'),
      render: (row) => (
        <Chip
          label={row.status || 'active'}
          size="small"
          color={row.status === 'active' || !row.status ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'createdAt',
      label: t('admin.users.created', 'Creado'),
      sortable: true,
      render: (row) => {
        const date = row.createdAt && typeof row.createdAt === 'object' && '_seconds' in row.createdAt
          ? new Date(row.createdAt._seconds * 1000)
          : new Date(row.createdAt as string);
        return <Typography variant="caption">{date.toLocaleDateString()}</Typography>;
      },
    },
    {
      field: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => { setEditUser(row); setNewRole(row.systemRole); }}
        >
          {t('common.edit', 'Editar')}
        </Typography>
      ),
    },
  ];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSaveRole = async () => {
    if (editUser && newRole !== editUser.systemRole) {
      await updateRole({ userId: editUser.id, role: newRole });
    }
    setEditUser(null);
  };

  const handleRoleFilterChange = (e: SelectChangeEvent) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        {t('admin.users.title', 'Gestión de Usuarios')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('admin.users.filterRole', 'Filtrar por rol')}</InputLabel>
          <Select
            value={roleFilter}
            label={t('admin.users.filterRole', 'Filtrar por rol')}
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="">{t('common.all', 'Todos')}</MenuItem>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataTable
        columns={columns}
        rows={users}
        loading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || 0}
        onPageChange={setPage}
        searchValue={search}
        onSearch={handleSearch}
        emptyMessage={t('admin.users.empty', 'No hay usuarios')}
      />

      <FormDialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSubmit={handleSaveRole}
        title={t('admin.users.editRole', 'Editar Rol')}
        loading={updatingRole}
      >
        {editUser && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {editUser.displayName} ({editUser.email})
            </Typography>
            <FormControl fullWidth>
              <InputLabel>{t('admin.users.role', 'Rol')}</InputLabel>
              <Select
                value={newRole}
                label={t('admin.users.role', 'Rol')}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </FormDialog>
    </Container>
  );
};

export default UsersPage;
