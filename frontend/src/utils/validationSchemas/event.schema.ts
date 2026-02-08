/**
 * Event Form Validation Schema
 *
 * Zod schema for validating event form data.
 */

import { z } from 'zod';

// Localized string schema
const localizedStringSchema = z.object({
  es: z.string().optional(),
  en: z.string().optional(),
  pt: z.string().optional(),
});

const localizedStringRequiredSchema = z
  .object({
    es: z.string().optional(),
    en: z.string().optional(),
    pt: z.string().optional(),
  })
  .refine(
    (data) => data.es || data.en || data.pt,
    { message: 'At least one language is required' }
  );

// Coordinates schema
const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .nullable()
  .optional();

// Money schema
const moneySchema = z
  .object({
    amount: z.number().min(0, 'Amount must be positive'),
    currency: z.string().min(1, 'Currency is required'),
  })
  .optional();

// Event type enum
const eventTypeSchema = z.enum([
  'conference',
  'special_event',
  'camp',
  'workshop',
  'retreat',
  'service',
  'concert',
  'outreach',
  'meeting',
  'training',
]);

// Event status enum
const eventStatusSchema = z.enum([
  'draft',
  'published',
  'cancelled',
  'postponed',
  'completed',
]);

// Online platform enum
const onlinePlatformSchema = z.enum([
  'zoom',
  'youtube',
  'facebook',
  'google_meet',
  'other',
]);

// Event location schema
const eventLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  coordinates: coordinatesSchema,
  isOnline: z.boolean(),
  onlineUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  onlinePlatform: onlinePlatformSchema.optional(),
  instructions: localizedStringSchema.optional(),
});

// Event registration schema
const eventRegistrationSchema = z.object({
  required: z.boolean(),
  maxAttendees: z.number().min(1).nullable(),
  currentAttendees: z.number().min(0).optional(),
  deadline: z.string().optional().or(z.literal('')),
  fee: moneySchema,
  requiresApproval: z.boolean().optional(),
  allowWaitlist: z.boolean().optional(),
  questionsRequired: z.array(z.string()).optional(),
});

// Main event form schema
export const eventFormSchema = z.object({
  // Basic info
  title: localizedStringRequiredSchema,
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  description: localizedStringRequiredSchema,

  // Church reference
  churchId: z.string().min(1, 'Church is required'),
  churchName: z.string().optional(),
  churchSlug: z.string().optional(),

  // Type and status
  type: eventTypeSchema,
  status: eventStatusSchema,

  // Date and time
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  isAllDay: z.boolean().optional(),

  // Location
  location: eventLocationSchema,

  // Registration
  registration: eventRegistrationSchema,

  // Media
  coverImage: z.string().url('Invalid image URL').nullable().optional(),
  galleryImages: z.array(z.string().url('Invalid image URL')).optional(),

  // Visibility
  isFeatured: z.boolean(),
  isPublic: z.boolean(),

  // Contact
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),

  // Organizer
  organizerName: z.string().optional().or(z.literal('')),
  organizerId: z.string().optional().or(z.literal('')),

  // Metadata
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  { message: 'End date must be after start date', path: ['endDate'] }
);

// Type inference
export type EventFormData = z.infer<typeof eventFormSchema>;

// Default values for form
export const defaultEventFormValues: EventFormData = {
  title: { es: '', en: '', pt: '' },
  slug: '',
  description: { es: '', en: '', pt: '' },
  churchId: '',
  churchName: '',
  churchSlug: '',
  type: 'special_event',
  status: 'draft',
  startDate: '',
  endDate: '',
  timezone: 'America/La_Paz',
  isAllDay: false,
  location: {
    name: '',
    address: '',
    city: '',
    coordinates: null,
    isOnline: false,
    onlineUrl: '',
    onlinePlatform: undefined,
    instructions: { es: '', en: '', pt: '' },
  },
  registration: {
    required: false,
    maxAttendees: null,
    currentAttendees: 0,
    deadline: '',
    fee: undefined,
    requiresApproval: false,
    allowWaitlist: false,
    questionsRequired: [],
  },
  coverImage: null,
  galleryImages: [],
  isFeatured: false,
  isPublic: true,
  contactEmail: '',
  contactPhone: '',
  organizerName: '',
  organizerId: '',
  tags: [],
};

export default eventFormSchema;
