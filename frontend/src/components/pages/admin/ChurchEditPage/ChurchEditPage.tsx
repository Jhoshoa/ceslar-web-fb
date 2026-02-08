/**
 * ChurchEditPage
 *
 * Page for editing an existing church.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box, Breadcrumbs, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';

import Typography from '../../../atoms/Typography/Typography';
import ChurchForm from '../../../organisms/ChurchForm/ChurchForm';
import {
  useGetChurchByIdQuery,
  useUpdateChurchMutation,
  useGetChurchesQuery,
} from '../../../../store/api/churchesApi';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../../store';
import type { ChurchFormData } from '../../../../utils/validationSchemas/church.schema';
import type { ChurchUpdateInput } from '@ceslar/shared-types';

const ChurchEditPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();

  const {
    data: church,
    isLoading: isLoadingChurch,
    error: churchError,
  } = useGetChurchByIdQuery(id!, { skip: !id });

  const [updateChurch, { isLoading: isUpdating }] = useUpdateChurchMutation();

  // Fetch all churches for parent selection (excluding current church)
  const { data: churchesData } = useGetChurchesQuery({ limit: 100 });
  const parentChurches = (churchesData?.data || [])
    .filter((c) => c.id !== id)
    .map((c) => ({
      id: c.id,
      name: typeof c.name === 'string' ? c.name : c.name?.es || '',
      level: c.level,
    }));

  const handleSubmit = async (data: ChurchFormData) => {
    if (!id) return;

    try {
      // Transform form data to API format
      const payload: ChurchUpdateInput & { id: string } = {
        id,
        name: data.name,
        slug: data.slug || undefined,
        level: data.level,
        parentChurchId: data.parentChurchId || null,
        isHeadquarters: data.isHeadquarters,
        isFeatured: data.isFeatured,
        country: data.country,
        countryCode: data.countryCode,
        department: data.department || undefined,
        province: data.province || undefined,
        city: data.city,
        address: data.address,
        coordinates: data.coordinates || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        socialMedia: data.socialMedia || undefined,
        description: data.description,
        history: data.history || undefined,
        foundationDate: data.foundationDate || undefined,
        serviceSchedule: data.serviceSchedule || undefined,
        coverImage: data.coverImage || undefined,
        logoImage: data.logoImage || undefined,
        status: data.status,
      };

      await updateChurch(payload).unwrap();
      dispatch(showSuccess(t('admin.churches.updateSuccess', 'Iglesia actualizada exitosamente')));
      navigate('/admin/churches');
    } catch (error) {
      console.error('Error updating church:', error);
      dispatch(showError(t('admin.churches.updateError', 'Error al actualizar la iglesia')));
    }
  };

  const handleCancel = () => {
    navigate('/admin/churches');
  };

  // Loading state
  if (isLoadingChurch) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (churchError || !church) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t('admin.churches.notFound', 'Iglesia no encontrada')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {t('admin.churches.notFoundDescription', 'La iglesia que buscas no existe o ha sido eliminada.')}
          </Typography>
          <MuiLink component={Link} to="/admin/churches">
            {t('admin.churches.backToList', 'Volver a la lista')}
          </MuiLink>
        </Box>
      </Container>
    );
  }

  const churchName = typeof church.name === 'string' ? church.name : church.name?.es || '';

  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={Link}
          to="/admin/dashboard"
          color="inherit"
          underline="hover"
        >
          {t('admin.dashboard.title', 'Dashboard')}
        </MuiLink>
        <MuiLink
          component={Link}
          to="/admin/churches"
          color="inherit"
          underline="hover"
        >
          {t('admin.churches.title', 'Iglesias')}
        </MuiLink>
        <Typography color="text.primary">
          {t('admin.churches.edit', 'Editar')}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('admin.churches.editChurch', 'Editar Iglesia')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {churchName}
        </Typography>
      </Box>

      {/* Church Form */}
      <ChurchForm
        initialData={church}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        isEdit={true}
        parentChurches={parentChurches}
      />
    </Container>
  );
};

export default ChurchEditPage;
