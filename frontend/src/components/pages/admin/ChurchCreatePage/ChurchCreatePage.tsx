/**
 * ChurchCreatePage
 *
 * Page for creating a new church.
 */

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';

import Typography from '../../../atoms/Typography/Typography';
import ChurchForm from '../../../organisms/ChurchForm/ChurchForm';
import {
  useCreateChurchMutation,
  useGetChurchesQuery,
} from '../../../../store/api/churchesApi';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../../store';
import type { ChurchFormData } from '../../../../utils/validationSchemas/church.schema';
import type { ChurchCreateInput } from '@ceslar/shared-types';

const ChurchCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [createChurch, { isLoading }] = useCreateChurchMutation();

  // Fetch all churches for parent selection
  const { data: churchesData } = useGetChurchesQuery({ limit: 100 });
  const parentChurches = (churchesData?.data || []).map((c) => ({
    id: c.id,
    name: typeof c.name === 'string' ? c.name : c.name?.es || '',
    level: c.level,
  }));

  const handleSubmit = async (data: ChurchFormData) => {
    try {
      // Transform form data to API format
      const payload: ChurchCreateInput = {
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
        serviceSchedule: data.serviceSchedule || undefined,
        coverImage: data.coverImage || undefined,
        logoImage: data.logoImage || undefined,
        status: data.status,
      };

      await createChurch(payload).unwrap();
      dispatch(showSuccess(t('admin.churches.createSuccess', 'Iglesia creada exitosamente')));
      navigate('/admin/churches');
    } catch (error) {
      console.error('Error creating church:', error);
      dispatch(showError(t('admin.churches.createError', 'Error al crear la iglesia')));
    }
  };

  const handleCancel = () => {
    navigate('/admin/churches');
  };

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
          {t('admin.churches.create', 'Nueva Iglesia')}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('admin.churches.create', 'Nueva Iglesia')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('admin.churches.createDescription', 'Completa el formulario para crear una nueva iglesia en el sistema.')}
        </Typography>
      </Box>

      {/* Church Form */}
      <ChurchForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        isEdit={false}
        parentChurches={parentChurches}
      />
    </Container>
  );
};

export default ChurchCreatePage;
