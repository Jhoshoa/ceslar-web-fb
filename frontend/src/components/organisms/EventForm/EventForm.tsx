/**
 * EventForm Organism
 *
 * Comprehensive form for creating and editing events.
 * Uses React Hook Form with Zod validation.
 */

import { ReactNode, useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';

import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import SelectField from '../../molecules/SelectField/SelectField';
import SwitchField from '../../molecules/SwitchField/SwitchField';
import LocalizedStringInput from '../LocalizedStringInput/LocalizedStringInput';
import ImageUploadField from '../ImageUploadField/ImageUploadField';
import CoordinatesInput from '../CoordinatesInput/CoordinatesInput';

import {
  eventFormSchema,
  EventFormData,
  defaultEventFormValues,
} from '../../../utils/validationSchemas/event.schema';
import type { Event } from '@ceslar/shared-types';

interface Church {
  id: string;
  name: string;
  slug?: string;
}

interface EventFormProps {
  initialData?: Partial<Event>;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  churches?: Church[];
}

const EVENT_TYPES = [
  { value: 'conference', label: 'Conferencia' },
  { value: 'special_event', label: 'Evento Especial' },
  { value: 'camp', label: 'Campamento' },
  { value: 'workshop', label: 'Taller' },
  { value: 'retreat', label: 'Retiro' },
  { value: 'service', label: 'Servicio' },
  { value: 'concert', label: 'Concierto' },
  { value: 'outreach', label: 'Evangelismo' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'training', label: 'Capacitación' },
];

const EVENT_STATUS = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'postponed', label: 'Pospuesto' },
  { value: 'completed', label: 'Completado' },
];

const ONLINE_PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook Live' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'other', label: 'Otro' },
];

const TIMEZONES = [
  { value: 'America/La_Paz', label: 'Bolivia (GMT-4)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Santiago', label: 'Chile (GMT-4/-3)' },
  { value: 'America/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Sao_Paulo', label: 'Brasil (GMT-3)' },
];

const CURRENCIES = [
  { value: 'BOB', label: 'Bolivianos (BOB)' },
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'ARS', label: 'Pesos Argentinos (ARS)' },
  { value: 'BRL', label: 'Reales (BRL)' },
];

// Get cloudinary config from environment
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

const EventForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
  churches = [],
}: EventFormProps): ReactNode => {
  const { t } = useTranslation();

  // Transform initial data to form values
  const getInitialValues = (): EventFormData => {
    if (!initialData) return defaultEventFormValues;

    return {
      title: initialData.title || { es: '', en: '', pt: '' },
      slug: initialData.slug || '',
      description: initialData.description || { es: '', en: '', pt: '' },
      churchId: initialData.churchId || '',
      churchName: initialData.churchName || '',
      churchSlug: initialData.churchSlug || '',
      type: initialData.type || 'special_event',
      status: initialData.status || 'draft',
      startDate: initialData.startDate ? formatDateForInput(initialData.startDate) : '',
      endDate: initialData.endDate ? formatDateForInput(initialData.endDate) : '',
      timezone: initialData.timezone || 'America/La_Paz',
      isAllDay: initialData.isAllDay || false,
      location: initialData.location || defaultEventFormValues.location,
      registration: {
        required: initialData.registration?.required || false,
        maxAttendees: initialData.registration?.maxAttendees || null,
        currentAttendees: initialData.registration?.currentAttendees || 0,
        deadline: initialData.registration?.deadline || '',
        fee: initialData.registration?.fee,
        requiresApproval: initialData.registration?.requiresApproval || false,
        allowWaitlist: initialData.registration?.allowWaitlist || false,
        questionsRequired: initialData.registration?.questionsRequired || [],
      },
      coverImage: initialData.coverImage || null,
      galleryImages: initialData.galleryImages || [],
      isFeatured: initialData.isFeatured || false,
      isPublic: initialData.isPublic !== false,
      contactEmail: initialData.contactEmail || '',
      contactPhone: initialData.contactPhone || '',
      organizerName: initialData.organizerName || '',
      organizerId: initialData.organizerId || '',
      tags: initialData.tags || [],
    };
  };

  const methods = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: getInitialValues(),
    mode: 'onBlur',
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const watchChurchId = watch('churchId');
  const watchIsOnline = watch('location.isOnline');
  const watchRegistrationRequired = watch('registration.required');
  const watchHasFee = watch('registration.fee');

  // Update church name when church changes
  useEffect(() => {
    if (watchChurchId) {
      const church = churches.find((c) => c.id === watchChurchId);
      if (church) {
        setValue('churchName', church.name);
        setValue('churchSlug', church.slug || '');
      }
    }
  }, [watchChurchId, churches, setValue]);

  // Generate slug from title
  const generateSlug = (title: { es?: string; en?: string; pt?: string }): string => {
    const text = title.es || title.en || title.pt || '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: { es?: string; en?: string; pt?: string }) => {
    const currentSlug = watch('slug');
    if (!currentSlug) {
      setValue('slug', generateSlug(value));
    }
  };

  const onFormSubmit = async (data: EventFormData) => {
    await onSubmit(data);
  };

  const accordionSx = {
    '&:before': { display: 'none' },
    boxShadow: 'none',
    border: 1,
    borderColor: 'divider',
    '&.Mui-expanded': { margin: 0 },
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Basic Information */}
          <Accordion defaultExpanded sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.basicInfo', 'Información Básica')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <LocalizedStringInput
                        {...field}
                        label={t('admin.events.form.title', 'Título del Evento')}
                        required
                        error={errors.title?.message}
                        placeholder="Ej: Conferencia Nacional 2026"
                        onChange={(value) => {
                          field.onChange(value);
                          handleTitleChange(value);
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.slug', 'Slug (URL)')}
                        error={errors.slug?.message}
                        placeholder="conferencia-nacional-2026"
                        description="Se genera automáticamente del título"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="churchId"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.events.form.church', 'Iglesia Organizadora')}
                        options={churches.map((c) => ({ value: c.id, label: c.name }))}
                        required
                        error={errors.churchId?.message}
                        placeholder="Seleccionar iglesia"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.events.form.type', 'Tipo de Evento')}
                        options={EVENT_TYPES}
                        required
                        error={errors.type?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.events.form.status', 'Estado')}
                        options={EVENT_STATUS}
                        required
                        error={errors.status?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <LocalizedStringInput
                        {...field}
                        label={t('admin.events.form.description', 'Descripción')}
                        required
                        multiline
                        rows={4}
                        error={errors.description?.message}
                        placeholder="Describe el evento..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.events.form.isFeatured', 'Evento Destacado')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Mostrar en la página principal"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="isPublic"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.events.form.isPublic', 'Evento Público')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Visible para todos los visitantes"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Date and Time */}
          <Accordion defaultExpanded sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.dateTime', 'Fecha y Hora')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('admin.events.form.startDate', 'Fecha y Hora de Inicio')}
                        type="datetime-local"
                        fullWidth
                        required
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('admin.events.form.endDate', 'Fecha y Hora de Fin')}
                        type="datetime-local"
                        fullWidth
                        required
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.events.form.timezone', 'Zona Horaria')}
                        options={TIMEZONES}
                        required
                        error={errors.timezone?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="isAllDay"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.events.form.isAllDay', 'Evento de día completo')}
                        name={field.name}
                        checked={field.value || false}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Location */}
          <Accordion defaultExpanded sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.location', 'Ubicación')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.name"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.locationName', 'Nombre del Lugar')}
                        required
                        error={errors.location?.name?.message}
                        placeholder="Ej: Auditorio Central"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="location.city"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.city', 'Ciudad')}
                        error={errors.location?.city?.message}
                        placeholder="Ej: La Paz"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="location.address"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.address', 'Dirección')}
                        required
                        error={errors.location?.address?.message}
                        placeholder="Ej: Av. 6 de Agosto #1234"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="location.coordinates"
                    control={control}
                    render={({ field }) => (
                      <CoordinatesInput
                        label={t('admin.events.form.coordinates', 'Coordenadas')}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        description="Para mostrar en el mapa"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Controller
                    name="location.isOnline"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.events.form.hasOnline', '¿Tiene transmisión en línea?')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Evento híbrido o solo en línea"
                      />
                    )}
                  />
                </Grid>
                {watchIsOnline && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="location.onlinePlatform"
                        control={control}
                        render={({ field }) => (
                          <SelectField
                            {...field}
                            value={field.value || ''}
                            label={t('admin.events.form.platform', 'Plataforma')}
                            options={ONLINE_PLATFORMS}
                            error={errors.location?.onlinePlatform?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="location.onlineUrl"
                        control={control}
                        render={({ field }) => (
                          <FormField
                            {...field}
                            label={t('admin.events.form.onlineUrl', 'URL de Transmisión')}
                            error={errors.location?.onlineUrl?.message}
                            placeholder="https://..."
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LinkIcon />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="location.instructions"
                        control={control}
                        render={({ field }) => (
                          <LocalizedStringInput
                            {...field}
                            value={field.value || { es: '', en: '', pt: '' }}
                            label={t('admin.events.form.instructions', 'Instrucciones de Acceso')}
                            multiline
                            rows={2}
                            placeholder="Instrucciones para unirse..."
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Registration */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HowToRegIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.registration', 'Registro')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="registration.required"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.events.form.registrationRequired', 'Requiere registro previo')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Los asistentes deben registrarse antes del evento"
                      />
                    )}
                  />
                </Grid>
                {watchRegistrationRequired && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.maxAttendees"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label={t('admin.events.form.maxAttendees', 'Capacidad Máxima')}
                            type="number"
                            fullWidth
                            size="small"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? parseInt(val) : null);
                            }}
                            placeholder="Sin límite"
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.deadline"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label={t('admin.events.form.deadline', 'Fecha Límite de Registro')}
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.requiresApproval"
                        control={control}
                        render={({ field }) => (
                          <SwitchField
                            label={t('admin.events.form.requiresApproval', 'Requiere aprobación')}
                            name={field.name}
                            checked={field.value || false}
                            onChange={field.onChange}
                            description="Aprobar manualmente cada registro"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.allowWaitlist"
                        control={control}
                        render={({ field }) => (
                          <SwitchField
                            label={t('admin.events.form.allowWaitlist', 'Permitir lista de espera')}
                            name={field.name}
                            checked={field.value || false}
                            onChange={field.onChange}
                            description="Cuando se alcance la capacidad máxima"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {t('admin.events.form.feeSection', 'Costo de Inscripción (opcional)')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.fee.amount"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label={t('admin.events.form.feeAmount', 'Monto')}
                            type="number"
                            fullWidth
                            size="small"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? parseFloat(val) : undefined);
                            }}
                            placeholder="0"
                            sx={{ mb: 2 }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="registration.fee.currency"
                        control={control}
                        render={({ field }) => (
                          <SelectField
                            {...field}
                            value={field.value || 'BOB'}
                            label={t('admin.events.form.currency', 'Moneda')}
                            options={CURRENCIES}
                          />
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Contact Information */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.contact', 'Contacto y Organizador')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="organizerName"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.organizerName', 'Nombre del Organizador')}
                        error={errors.organizerName?.message}
                        placeholder="Ej: Ministerio de Jóvenes"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="contactEmail"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.contactEmail', 'Email de Contacto')}
                        type="email"
                        error={errors.contactEmail?.message}
                        placeholder="eventos@ceslar.org"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="contactPhone"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.events.form.contactPhone', 'Teléfono de Contacto')}
                        error={errors.contactPhone?.message}
                        placeholder="+591..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Images */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.events.form.images', 'Imágenes')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Controller
                name="coverImage"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    label={t('admin.events.form.coverImage', 'Imagen de Portada')}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.coverImage?.message}
                    aspectRatio="landscape"
                    previewHeight={200}
                    maxSizeMB={5}
                    cloudinaryConfig={{
                      ...CLOUDINARY_CONFIG,
                      folder: 'events/covers',
                    }}
                    description="Imagen 16:9 recomendada, máx. 5MB"
                  />
                )}
              />
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Form Actions */}
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 0,
            mt: 3,
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Button variant="outlined" onClick={onCancel} disabled={isLoading || isSubmitting}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? t('common.saving', 'Guardando...')
              : isEdit
              ? t('common.save', 'Guardar')
              : t('common.create', 'Crear')}
          </Button>
        </Paper>
      </Box>
    </FormProvider>
  );
};

// Helper function to format date for datetime-local input
function formatDateForInput(date: string): string {
  try {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export default EventForm;
