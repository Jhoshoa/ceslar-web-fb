/**
 * ChurchForm Organism
 *
 * Comprehensive form for creating and editing churches.
 * Uses React Hook Form with Zod validation.
 */

import { ReactNode } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactsIcon from '@mui/icons-material/Contacts';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';

import Typography from '../../atoms/Typography/Typography';
import Button from '../../atoms/Button/Button';
import FormField from '../../molecules/FormField/FormField';
import SelectField from '../../molecules/SelectField/SelectField';
import SwitchField from '../../molecules/SwitchField/SwitchField';
import LocalizedStringInput from '../LocalizedStringInput/LocalizedStringInput';
import ImageUploadField from '../ImageUploadField/ImageUploadField';
import CoordinatesInput from '../CoordinatesInput/CoordinatesInput';
import SocialMediaLinks from '../SocialMediaLinks/SocialMediaLinks';
import ServiceScheduleManager from '../ServiceScheduleManager/ServiceScheduleManager';

import {
  churchFormSchema,
  ChurchFormData,
  defaultChurchFormValues,
} from '../../../utils/validationSchemas/church.schema';
import type { Church } from '@ceslar/shared-types';

interface ChurchFormProps {
  initialData?: Partial<Church>;
  onSubmit: (data: ChurchFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  parentChurches?: { id: string; name: string; level: string }[];
}

const CHURCH_LEVELS = [
  { value: 'headquarters', label: 'Sede Internacional' },
  { value: 'country', label: 'País' },
  { value: 'department', label: 'Departamento' },
  { value: 'province', label: 'Provincia' },
  { value: 'local', label: 'Local' },
];

const CHURCH_STATUS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'suspended', label: 'Suspendido' },
];

const COUNTRIES = [
  { value: 'Bolivia', label: 'Bolivia', code: 'BO' },
  { value: 'Argentina', label: 'Argentina', code: 'AR' },
  { value: 'Brazil', label: 'Brasil', code: 'BR' },
  { value: 'Chile', label: 'Chile', code: 'CL' },
  { value: 'Colombia', label: 'Colombia', code: 'CO' },
  { value: 'Ecuador', label: 'Ecuador', code: 'EC' },
  { value: 'Paraguay', label: 'Paraguay', code: 'PY' },
  { value: 'Peru', label: 'Perú', code: 'PE' },
  { value: 'Uruguay', label: 'Uruguay', code: 'UY' },
  { value: 'Venezuela', label: 'Venezuela', code: 'VE' },
];

// Get cloudinary config from environment
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

const ChurchForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
  parentChurches = [],
}: ChurchFormProps): ReactNode => {
  const { t } = useTranslation();

  // Transform initial data to form values
  const getInitialValues = (): ChurchFormData => {
    if (!initialData) return defaultChurchFormValues;

    return {
      name: typeof initialData.name === 'string' ? initialData.name : '',
      slug: initialData.slug || '',
      level: initialData.level || 'local',
      parentChurchId: initialData.parentChurchId || null,
      isHeadquarters: initialData.isHeadquarters || false,
      isFeatured: initialData.isFeatured || false,
      country: initialData.country || 'Bolivia',
      countryCode: initialData.countryCode || 'BO',
      department: initialData.department || '',
      province: initialData.province || '',
      city: initialData.city || '',
      address: initialData.address || '',
      coordinates: initialData.coordinates || null,
      phone: initialData.phone || '',
      email: initialData.email || '',
      website: initialData.website || '',
      socialMedia: initialData.socialMedia || {},
      description: initialData.description || { es: '', en: '', pt: '' },
      serviceSchedule: initialData.serviceSchedule || [],
      coverImage: initialData.coverImage || null,
      logoImage: initialData.logoImage || null,
      status: initialData.status || 'active',
    };
  };

  const methods = useForm<ChurchFormData>({
    resolver: zodResolver(churchFormSchema),
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

  const watchCountry = watch('country');
  const watchLevel = watch('level');

  // Update country code when country changes
  const handleCountryChange = (country: string) => {
    const countryData = COUNTRIES.find((c) => c.value === country);
    if (countryData) {
      setValue('countryCode', countryData.code);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim();
  };

  const handleNameBlur = (name: string) => {
    const currentSlug = watch('slug');
    if (!currentSlug && name) {
      setValue('slug', generateSlug(name));
    }
  };

  const onFormSubmit = async (data: ChurchFormData) => {
    await onSubmit(data);
  };

  // Filter parent churches based on level
  const getAvailableParentChurches = () => {
    const levelOrder = ['headquarters', 'country', 'department', 'province', 'local'];
    const currentLevelIndex = levelOrder.indexOf(watchLevel);

    if (currentLevelIndex <= 0) return []; // Headquarters can't have parent

    return parentChurches.filter((church) => {
      const churchLevelIndex = levelOrder.indexOf(church.level);
      return churchLevelIndex < currentLevelIndex;
    });
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
      <Box
        component="form"
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Basic Information */}
          <Accordion defaultExpanded sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.churches.form.basicInfo', 'Información Básica')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.name', 'Nombre')}
                        required
                        error={errors.name?.message}
                        placeholder="Ej: Cristo Es La Respuesta - Sopocachi"
                        onBlur={(e) => {
                          field.onBlur();
                          handleNameBlur(e.target.value);
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
                        label={t('admin.churches.form.slug', 'Slug (URL)')}
                        error={errors.slug?.message}
                        placeholder="ej: sopocachi"
                        description="Se genera automáticamente del nombre"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="level"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.churches.form.level', 'Nivel')}
                        options={CHURCH_LEVELS}
                        required
                        error={errors.level?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="parentChurchId"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        label={t('admin.churches.form.parentChurch', 'Iglesia Padre')}
                        options={[
                          { value: '', label: 'Ninguna' },
                          ...getAvailableParentChurches().map((c) => ({
                            value: c.id,
                            label: c.name,
                          })),
                        ]}
                        error={errors.parentChurchId?.message}
                        disabled={watchLevel === 'headquarters'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label={t('admin.churches.form.status', 'Estado')}
                        options={CHURCH_STATUS}
                        required
                        error={errors.status?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="isHeadquarters"
                    control={control}
                    render={({ field }) => (
                      <SwitchField
                        label={t('admin.churches.form.isHeadquarters', 'Es sede principal')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Marcar si esta es la sede internacional"
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
                        label={t('admin.churches.form.isFeatured', 'Destacada')}
                        name={field.name}
                        checked={field.value}
                        onChange={field.onChange}
                        description="Mostrar en la página principal"
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
                  {t('admin.churches.form.location', 'Ubicación')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleCountryChange(e.target.value);
                        }}
                        label={t('admin.churches.form.country', 'País')}
                        options={COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
                        required
                        error={errors.country?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.countryCode', 'Código de País')}
                        required
                        error={errors.countryCode?.message}
                        disabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.department', 'Departamento/Estado')}
                        error={errors.department?.message}
                        placeholder="Ej: La Paz, Santa Cruz"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.province', 'Provincia')}
                        error={errors.province?.message}
                        placeholder="Ej: Murillo"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.city', 'Ciudad')}
                        required
                        error={errors.city?.message}
                        placeholder="Ej: La Paz"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.address', 'Dirección')}
                        required
                        error={errors.address?.message}
                        placeholder="Ej: Av. 6 de Agosto #1234"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="coordinates"
                    control={control}
                    render={({ field }) => (
                      <CoordinatesInput
                        label={t('admin.churches.form.coordinates', 'Coordenadas')}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.coordinates?.message}
                        description="Latitud y longitud para el mapa"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Contact Information */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactsIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.churches.form.contact', 'Información de Contacto')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.phone', 'Teléfono')}
                        error={errors.phone?.message}
                        placeholder="+591 2 1234567"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.email', 'Email')}
                        type="email"
                        error={errors.email?.message}
                        placeholder="contacto@ceslar.org"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        {...field}
                        label={t('admin.churches.form.website', 'Sitio Web')}
                        type="url"
                        error={errors.website?.message}
                        placeholder="https://ceslar.org"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Controller
                    name="socialMedia"
                    control={control}
                    render={({ field }) => (
                      <SocialMediaLinks
                        label={t('admin.churches.form.socialMedia', 'Redes Sociales')}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.socialMedia?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Description */}
          <Accordion defaultExpanded sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.churches.form.description', 'Descripción')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <LocalizedStringInput
                    label={t('admin.churches.form.descriptionLabel', 'Descripción de la Iglesia')}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    multiline
                    rows={4}
                    required
                    error={errors.description?.message}
                    placeholder="Describe la iglesia, su misión y visión..."
                  />
                )}
              />
            </AccordionDetails>
          </Accordion>

          {/* Images */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.churches.form.images', 'Imágenes')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="logoImage"
                    control={control}
                    render={({ field }) => (
                      <ImageUploadField
                        label={t('admin.churches.form.logo', 'Logo')}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.logoImage?.message}
                        aspectRatio="square"
                        previewHeight={150}
                        maxSizeMB={2}
                        cloudinaryConfig={{
                          ...CLOUDINARY_CONFIG,
                          folder: 'churches/logos',
                        }}
                        description="Imagen cuadrada, máx. 2MB"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="coverImage"
                    control={control}
                    render={({ field }) => (
                      <ImageUploadField
                        label={t('admin.churches.form.cover', 'Imagen de Portada')}
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.coverImage?.message}
                        aspectRatio="landscape"
                        previewHeight={150}
                        maxSizeMB={5}
                        cloudinaryConfig={{
                          ...CLOUDINARY_CONFIG,
                          folder: 'churches/covers',
                        }}
                        description="Imagen 16:9, máx. 5MB"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Service Schedule */}
          <Accordion sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('admin.churches.form.schedule', 'Horarios de Servicio')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Controller
                name="serviceSchedule"
                control={control}
                render={({ field }) => (
                  <ServiceScheduleManager
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.serviceSchedule?.message}
                    description="Agrega los horarios de los servicios regulares"
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

export default ChurchForm;
