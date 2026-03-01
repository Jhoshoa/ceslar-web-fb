import { useState, useMemo } from 'react';
import { Container, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '../../../../store/api/usersApi';
import { useGetRolesQuery } from '../../../../store/api/rolesApi';
import DataTable, { TableColumn, DataTableRow } from '../../../organisms/DataTable/DataTable';
import Typography from '../../../atoms/Typography/Typography';
import Chip from '../../../atoms/Chip/Chip';
import Avatar from '../../../atoms/Avatar/Avatar';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import type { User } from '@ceslar/shared-types';

type UserRow = User & DataTableRow;

const UsersPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState<string>('user');

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit: 10,
    search: search || undefined,
    systemRole: roleFilter || undefined,
  });

  // Fetch system-scoped roles for the dropdown
  const { data: allRoles = [] } = useGetRolesQuery({ scope: 'system' });

  // Get system roles for dropdowns
  const systemRoles = useMemo(() => {
    return allRoles.map(role => ({
      id: role.id,
      name: role.name,
      color: role.color,
    }));
  }, [allRoles]);

  const [updateRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();

  const users = (data?.data || []) as UserRow[];
  const pagination = data?.pagination;

  const columns: TableColumn<UserRow>[] = [
    {
      field: 'displayName',
      label: t('admin.users.name', 'Nombre'),
      sortable: true,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={row.photoURL || undefined} sx={{ width: 32, height: 32 }}>
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
      render: (row) => {
        const role = systemRoles.find(r => r.name === row.systemRole);
        return (
          <Chip
            label={row.systemRole || 'user'}
            size="small"
            color={row.systemRole === 'system_admin' ? 'error' : 'default'}
            variant="outlined"
            sx={role?.color ? { borderColor: role.color, color: role.color } : undefined}
          />
        );
      },
    },
    {
      field: 'isActive',
      label: t('admin.users.status', 'Estado'),
      render: (row) => (
        <Chip
          label={row.isActive !== false ? 'active' : 'inactive'}
          size="small"
          color={row.isActive !== false ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'createdAt',
      label: t('admin.users.created', 'Creado'),
      sortable: true,
      render: (row) => {
        if (!row.createdAt) return <Typography variant="caption">-</Typography>;
        const createdAt = row.createdAt as { _seconds?: number } | string;
        const date = typeof createdAt === 'object' && createdAt._seconds
          ? new Date(createdAt._seconds * 1000)
          : new Date(createdAt as string);
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
          onClick={() => { setEditUser(row); setNewRole(row.systemRole || 'user'); }}
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
      await updateRole({ id: editUser.id, systemRole: newRole });
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
    <Container maxWidth="xl">
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
            {systemRoles.map((role) => (
              <MenuItem key={role.id} value={role.name}>{role.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataTable<UserRow>
        columns={columns}
        rows={users}
        loading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total || 0}
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
                {systemRoles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>{role.name}</MenuItem>
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
