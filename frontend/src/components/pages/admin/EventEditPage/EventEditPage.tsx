/**
 * EventEditPage
 *
 * Page for editing an existing event.
 */

import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box, Breadcrumbs, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';

import Typography from '../../../atoms/Typography/Typography';
import EventForm from '../../../organisms/EventForm/EventForm';
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
} from '../../../../store/api/eventsApi';
import { useGetChurchesQuery } from '../../../../store/api/churchesApi';
import { showSuccess, showError } from '../../../../store/slices/ui.slice';
import type { AppDispatch } from '../../../../store';
import type { EventFormData } from '../../../../utils/validationSchemas/event.schema';
import type { EventUpdateInput } from '@ceslar/shared-types';

const EventEditPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const lang = i18n.language?.split('-')[0] || 'es';

  const {
    data: event,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useGetEventByIdQuery(id!, { skip: !id });

  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  // Fetch all churches for selection
  const { data: churchesData } = useGetChurchesQuery({ limit: 100 });
  const churches = (churchesData?.data || []).map((c) => ({
    id: c.id,
    name: typeof c.name === 'string' ? c.name : c.name?.es || '',
    slug: c.slug,
  }));

  const handleSubmit = async (data: EventFormData) => {
    if (!id) return;

    try {
      // Transform form data to API format
      const payload: EventUpdateInput & { id: string } = {
        id,
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
          currentAttendees: data.registration.currentAttendees || 0,
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

      await updateEvent(payload).unwrap();
      dispatch(showSuccess(t('admin.events.updateSuccess', 'Evento actualizado exitosamente')));
      navigate('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      dispatch(showError(t('admin.events.updateError', 'Error al actualizar el evento')));
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  // Loading state
  if (isLoadingEvent) {
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
  if (eventError || !event) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t('admin.events.notFound', 'Evento no encontrado')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {t('admin.events.notFoundDescription', 'El evento que buscas no existe o ha sido eliminado.')}
          </Typography>
          <MuiLink component={Link} to="/admin/events">
            {t('admin.events.backToList', 'Volver a la lista')}
          </MuiLink>
        </Box>
      </Container>
    );
  }

  const getLocalizedTitle = () => {
    if (typeof event.title === 'string') return event.title;
    return event.title?.[lang as 'es' | 'en' | 'pt'] || event.title?.es || '';
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
          {t('admin.events.edit', 'Editar')}
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('admin.events.editEvent', 'Editar Evento')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {getLocalizedTitle()}
        </Typography>
      </Box>

      {/* Event Form */}
      <EventForm
        initialData={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isUpdating}
        isEdit={true}
        churches={churches}
      />
    </Container>
  );
};

export default EventEditPage;
