import { useState, useMemo } from 'react';
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useDuplicateRoleMutation,
} from '../../../../store/api/rolesApi';
import { useGetPermissionsByCategoryQuery } from '../../../../store/api/permissionsApi';
import { useGetChurchesQuery } from '../../../../store/api/churchesApi';
import DataTable, { TableColumn, DataTableRow } from '../../../organisms/DataTable/DataTable';
import Typography from '../../../atoms/Typography/Typography';
import Chip from '../../../atoms/Chip/Chip';
import Button from '../../../atoms/Button/Button';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import type { Role, RoleScope, RoleCreateInput, PermissionEntity } from '@ceslar/shared-types';

type RoleRow = Role & DataTableRow;

interface RoleFormState {
  name: string;
  description: string;
  scope: RoleScope;
  churchId: string;
  permissions: string[];
  color: string;
}

const initialFormState: RoleFormState = {
  name: '',
  description: '',
  scope: 'church',
  churchId: '',
  permissions: [],
  color: '#1976d2',
};

const SCOPE_OPTIONS: { value: RoleScope | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'system', label: 'Sistema' },
  { value: 'church', label: 'Iglesia' },
];

const RolesPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [scopeFilter, setScopeFilter] = useState<RoleScope | ''>('');
  const [search, setSearch] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleRow | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRow | null>(null);
  const [duplicateRole, setDuplicateRole] = useState<RoleRow | null>(null);
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateChurchId, setDuplicateChurchId] = useState<string>('');

  // Form state
  const [formState, setFormState] = useState<RoleFormState>(initialFormState);

  // API queries
  const { data: roles = [], isLoading } = useGetRolesQuery(
    scopeFilter ? { scope: scopeFilter } : undefined
  );
  const { data: permissionsByCategory = {} } = useGetPermissionsByCategoryQuery();
  const { data: churchesData } = useGetChurchesQuery({ limit: 100 });
  const churches = churchesData?.data || [];

  // API mutations
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const [deleteRoleMutation, { isLoading: deleting }] = useDeleteRoleMutation();
  const [duplicateRoleMutation, { isLoading: duplicating }] = useDuplicateRoleMutation();

  // Filter roles by search
  const filteredRoles = useMemo(() => {
    if (!search) return roles as RoleRow[];
    const searchLower = search.toLowerCase();
    return (roles as RoleRow[]).filter(
      (role) =>
        role.name.toLowerCase().includes(searchLower) ||
        role.description?.toLowerCase().includes(searchLower)
    );
  }, [roles, search]);

  // Table columns
  const columns: TableColumn<RoleRow>[] = [
    {
      field: 'name',
      label: t('admin.roles.name', 'Nombre'),
      sortable: true,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.color && (
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: row.color,
                flexShrink: 0,
              }}
            />
          )}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.name}
            </Typography>
            {row.description && (
              <Typography variant="caption" color="textSecondary">
                {row.description}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: 'scope',
      label: t('admin.roles.scope', 'Alcance'),
      render: (row) => (
        <Chip
          label={row.scope === 'system' ? 'Sistema' : 'Iglesia'}
          size="small"
          color={row.scope === 'system' ? 'error' : 'primary'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'permissions',
      label: t('admin.roles.permissions', 'Permisos'),
      render: (row) => (
        <Typography variant="body2" color="textSecondary">
          {row.permissions.length} {t('admin.roles.permissionsCount', 'permisos')}
        </Typography>
      ),
    },
    {
      field: 'isDefault',
      label: t('admin.roles.type', 'Tipo'),
      render: (row) => (
        <Chip
          label={row.isDefault ? 'Por defecto' : 'Personalizado'}
          size="small"
          color={row.isDefault ? 'default' : 'success'}
          variant={row.isDefault ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip
            title={
              row.isDefault
                ? t('admin.roles.cannotEditDefault', 'Los roles por defecto no se pueden editar')
                : t('common.edit', 'Editar')
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => handleEditClick(row)}
                disabled={row.isDefault}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('admin.roles.duplicate', 'Duplicar')}>
            <IconButton size="small" onClick={() => handleDuplicateClick(row)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.isDefault
                ? t('admin.roles.cannotDeleteDefault', 'Los roles por defecto no se pueden eliminar')
                : t('common.delete', 'Eliminar')
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => setDeleteRole(row)}
                disabled={row.isDefault}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Handlers
  const handleScopeChange = (e: SelectChangeEvent) => {
    setScopeFilter(e.target.value as RoleScope | '');
  };

  const handleCreateClick = () => {
    setFormState(initialFormState);
    setCreateOpen(true);
  };

  const handleEditClick = (role: RoleRow) => {
    setFormState({
      name: role.name,
      description: role.description || '',
      scope: role.scope,
      churchId: role.churchId || '',
      permissions: role.permissions,
      color: role.color || '#1976d2',
    });
    setEditRole(role);
  };

  const handleDuplicateClick = (role: RoleRow) => {
    setDuplicateName(`${role.name} (copia)`);
    setDuplicateChurchId(role.churchId || '');
    setDuplicateRole(role);
  };

  const handleFormChange = (field: keyof RoleFormState, value: string | string[] | RoleScope) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormState((prev) => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions };
    });
  };

  const handleCategoryToggle = (categoryPermissions: PermissionEntity[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => formState.permissions.includes(id));

    setFormState((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => !categoryIds.includes(p)),
        };
      } else {
        const newPermissions = new Set([...prev.permissions, ...categoryIds]);
        return { ...prev, permissions: Array.from(newPermissions) };
      }
    });
  };

  const handleCreateSubmit = async () => {
    // Validate churchId for church-scoped roles
    if (formState.scope === 'church' && !formState.churchId) {
      dispatch(showError(t('admin.roles.churchRequired', 'Debe seleccionar una iglesia para roles de iglesia')));
      return;
    }
    const input: RoleCreateInput = {
      name: formState.name,
      description: formState.description || undefined,
      scope: formState.scope,
      churchId: formState.scope === 'church' ? formState.churchId : undefined,
      permissions: formState.permissions,
      color: formState.color,
    };
    try {
      const result = await createRole(input).unwrap();
      dispatch(showSuccess(t('admin.roles.createSuccess', `Rol "${result.name}" creado exitosamente`)));
      setCreateOpen(false);
      setFormState(initialFormState);
    } catch (err) {
      const error = err as { data?: { error?: { message?: string } }; message?: string };
      const message = error.data?.error?.message || error.message || t('admin.roles.createError', 'Error al crear el rol');
      dispatch(showError(message));
    }
  };

  const handleEditSubmit = async () => {
    if (!editRole) return;
    try {
      const result = await updateRole({
        id: editRole.id,
        name: formState.name,
        description: formState.description || undefined,
        permissions: formState.permissions,
        color: formState.color,
      }).unwrap();
      dispatch(showSuccess(t('admin.roles.updateSuccess', `Rol "${result.name}" actualizado exitosamente`)));
      setEditRole(null);
    } catch (err) {
      const error = err as { data?: { error?: { message?: string } }; message?: string };
      const message = error.data?.error?.message || error.message || t('admin.roles.updateError', 'Error al actualizar el rol');
      dispatch(showError(message));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRole) return;
    try {
      await deleteRoleMutation(deleteRole.id).unwrap();
      dispatch(showSuccess(t('admin.roles.deleteSuccess', `Rol "${deleteRole.name}" eliminado exitosamente`)));
      setDeleteRole(null);
    } catch (err) {
      const error = err as { data?: { error?: { message?: string } }; message?: string };
      const message = error.data?.error?.message || error.message || t('admin.roles.deleteError', 'Error al eliminar el rol');
      dispatch(showError(message));
    }
  };

  const handleDuplicateConfirm = async () => {
    if (!duplicateRole) return;
    // For church-scoped roles, churchId is required
    if (duplicateRole.scope === 'church' && !duplicateChurchId) {
      dispatch(showError(t('admin.roles.churchRequired', 'Debe seleccionar una iglesia para roles de iglesia')));
      return;
    }
    try {
      const result = await duplicateRoleMutation({
        id: duplicateRole.id,
        newName: duplicateName,
        churchId: duplicateRole.scope === 'church' ? duplicateChurchId : undefined,
      }).unwrap();
      dispatch(showSuccess(t('admin.roles.duplicateSuccess', `Rol "${result.name}" creado exitosamente`)));
      setDuplicateRole(null);
      setDuplicateChurchId('');
    } catch (err) {
      const error = err as { data?: { error?: { message?: string } }; message?: string };
      const message = error.data?.error?.message || error.message || t('admin.roles.duplicateError', 'Error al duplicar el rol');
      dispatch(showError(message));
    }
  };

  // Render permission selector
  const renderPermissionSelector = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t('admin.roles.selectPermissions', 'Seleccionar Permisos')}
      </Typography>
      {Object.entries(permissionsByCategory).map(([category, permissions]) => {
        const categoryIds = permissions.map((p: PermissionEntity) => p.id);
        const selectedCount = categoryIds.filter((id: string) =>
          formState.permissions.includes(id)
        ).length;
        const allSelected = selectedCount === categoryIds.length;
        const someSelected = selectedCount > 0 && !allSelected;

        return (
          <Accordion key={category} disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FormControlLabel
                onClick={(e) => e.stopPropagation()}
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={() => handleCategoryToggle(permissions)}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Chip label={`${selectedCount}/${categoryIds.length}`} size="small" />
                  </Box>
                }
              />
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {permissions.map((permission: PermissionEntity) => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Checkbox
                        checked={formState.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{permission.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {permission.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.roles.title', 'Roles y Permisos')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('admin.roles.create', 'Crear Rol')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('admin.roles.filterScope', 'Filtrar por alcance')}</InputLabel>
          <Select
            value={scopeFilter}
            label={t('admin.roles.filterScope', 'Filtrar por alcance')}
            onChange={handleScopeChange}
          >
            {SCOPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataTable<RoleRow>
        columns={columns}
        rows={filteredRoles}
        loading={isLoading}
        searchValue={search}
        onSearch={setSearch}
        emptyMessage={t('admin.roles.empty', 'No hay roles')}
      />

      {/* Create Role Dialog */}
      <FormDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setFormState(initialFormState);
        }}
        onSubmit={handleCreateSubmit}
        title={t('admin.roles.createTitle', 'Crear Nuevo Rol')}
        loading={creating}
        maxWidth="md"
        disableSubmit={
          !formState.name ||
          formState.permissions.length === 0 ||
          (formState.scope === 'church' && !formState.churchId)
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.roles.name', 'Nombre')}
            value={formState.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={t('admin.roles.description', 'Descripcion')}
            value={formState.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.roles.scope', 'Alcance')}</InputLabel>
              <Select
                value={formState.scope}
                label={t('admin.roles.scope', 'Alcance')}
                onChange={(e) => {
                  handleFormChange('scope', e.target.value as RoleScope);
                  // Clear churchId when switching to system scope
                  if (e.target.value === 'system') {
                    handleFormChange('churchId', '');
                  }
                }}
              >
                <MenuItem value="system">Sistema</MenuItem>
                <MenuItem value="church">Iglesia</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('admin.roles.color', 'Color')}
              type="color"
              value={formState.color}
              onChange={(e) => handleFormChange('color', e.target.value)}
              sx={{ width: 120 }}
              InputProps={{ sx: { height: 56 } }}
            />
          </Box>
          {formState.scope === 'church' && (
            <FormControl fullWidth required>
              <InputLabel>{t('admin.roles.church', 'Iglesia')}</InputLabel>
              <Select
                value={formState.churchId}
                label={t('admin.roles.church', 'Iglesia')}
                onChange={(e) => handleFormChange('churchId', e.target.value)}
              >
                {churches.map((church) => (
                  <MenuItem key={church.id} value={church.id}>
                    {church.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {renderPermissionSelector()}
        </Box>
      </FormDialog>

      {/* Edit Role Dialog */}
      <FormDialog
        open={!!editRole}
        onClose={() => setEditRole(null)}
        onSubmit={handleEditSubmit}
        title={t('admin.roles.editTitle', 'Editar Rol')}
        loading={updating}
        maxWidth="md"
        disableSubmit={!formState.name || formState.permissions.length === 0}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.roles.name', 'Nombre')}
            value={formState.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={t('admin.roles.description', 'Descripcion')}
            value={formState.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label={t('admin.roles.color', 'Color')}
            type="color"
            value={formState.color}
            onChange={(e) => handleFormChange('color', e.target.value)}
            sx={{ width: 120 }}
            InputProps={{ sx: { height: 56 } }}
          />
          {renderPermissionSelector()}
        </Box>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteRole}
        onClose={() => setDeleteRole(null)}
        onConfirm={handleDeleteConfirm}
        title={t('admin.roles.deleteTitle', 'Eliminar Rol')}
        message={t('admin.roles.deleteMessage', `¿Estas seguro de eliminar el rol "${deleteRole?.name}"? Esta accion no se puede deshacer.`)}
        confirmLabel={t('common.delete', 'Eliminar')}
        loading={deleting}
        destructive
      />

      {/* Duplicate Dialog */}
      <FormDialog
        open={!!duplicateRole}
        onClose={() => {
          setDuplicateRole(null);
          setDuplicateChurchId('');
        }}
        onSubmit={handleDuplicateConfirm}
        title={t('admin.roles.duplicateTitle', 'Duplicar Rol')}
        loading={duplicating}
        disableSubmit={!duplicateName || (duplicateRole?.scope === 'church' && !duplicateChurchId)}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('admin.roles.newName', 'Nuevo Nombre')}
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            fullWidth
            autoFocus
          />
          {duplicateRole?.scope === 'church' && (
            <FormControl fullWidth required>
              <InputLabel>{t('admin.roles.church', 'Iglesia')}</InputLabel>
              <Select
                value={duplicateChurchId}
                label={t('admin.roles.church', 'Iglesia')}
                onChange={(e) => setDuplicateChurchId(e.target.value)}
              >
                {churches.map((church) => (
                  <MenuItem key={church.id} value={church.id}>
                    {church.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {duplicateRole?.scope === 'church' && (
            <Typography variant="caption" color="textSecondary">
              {t('admin.roles.churchScopeNote', 'Los roles de iglesia deben estar asociados a una iglesia específica.')}
            </Typography>
          )}
        </Box>
      </FormDialog>
    </Container>
  );
};

export default RolesPage;
