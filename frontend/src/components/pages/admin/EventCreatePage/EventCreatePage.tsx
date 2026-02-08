/**
 * EventCreatePage
 *
 * Page for creating a new event.
 */

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';

import Typography from '../../../atoms/Typography/Typography';
import EventForm from '../../../organisms/EventForm/EventForm';
import {
  useCreateEventMutation,
} from '../../../../store/api/eventsApi';
import { useGetChurchesQuery } from '../../../../store/api/churchesApi';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../../store';
import type { EventFormData } from '../../../../utils/validationSchemas/event.schema';
import type { EventCreateInput } from '@ceslar/shared-types';

const EventCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [createEvent, { isLoading }] = useCreateEventMutation();

  // Fetch all churches for selection
  const { data: churchesData } = useGetChurchesQuery({ limit: 100 });
  const churches = (churchesData?.data || []).map((c) => ({
    id: c.id,
    name: typeof c.name === 'string' ? c.name : c.name?.es || '',
    slug: c.slug,
  }));

  const handleSubmit = async (data: EventFormData) => {
    try {
      // Transform form data to API format
      const payload: EventCreateInput = {
        title: data.title,
        slug: data.slug || undefined,
        description: data.description,
        churchId: data.churchId,
        churchName: data.churchName || '',
        churchSlug: data.churchSlug || '',
        type: data.type,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        timezone: data.timezone,
        isAllDay: data.isAllDay,
        location: {
          name: data.location.name,
          address: data.location.address,
          city: data.location.city,
          coordinates: data.location.coordinates || undefined,
          isOnline: data.location.isOnline,
          onlineUrl: data.location.onlineUrl || undefined,
          onlinePlatform: data.location.onlinePlatform,
          instructions: data.location.instructions,
        },
        registration: {
          required: data.registration.required,
          maxAttendees: data.registration.maxAttendees,
          currentAttendees: 0,
          deadline: data.registration.deadline || undefined,
          fee: data.registration.fee,
          requiresApproval: data.registration.requiresApproval,
          allowWaitlist: data.registration.allowWaitlist,
          questionsRequired: data.registration.questionsRequired,
        },
        coverImage: data.coverImage || null,
        galleryImages: data.galleryImages,
        isFeatured: data.isFeatured,
        isPublic: data.isPublic,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
        organizerName: data.organizerName || undefined,
        organizerId: data.organizerId || undefined,
        tags: data.tags,
      };

      await createEvent(payload).unwrap();
      dispatch(showSuccess(t('admin.events.createSuccess', 'Evento creado exitosamente')));
      navigate('/admin/events');
    } catch (error) {
      console.error('Error creating event:', error);
      dispatch(showError(t('admin.events.createError', 'Error al crear el evento')));
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
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
          to="/admin/events"
          color="inherit"
          underline="hover"
        >
          {t('admin.events.title', 'Eventos')}
        </MuiLink>
        <Typography color="text.primary">
          {t('admin.events.create', 'Nuevo Evento')}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('admin.events.create', 'Nuevo Evento')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('admin.events.createDescription', 'Completa el formulario para crear un nuevo evento.')}
        </Typography>
      </Box>

      {/* Event Form */}
      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        isEdit={false}
        churches={churches}
      />
    </Container>
  );
};

export default EventCreatePage;
