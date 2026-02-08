/**
 * Church Form Validation Schema
 *
 * Zod schema for validating church form data.
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
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180'),
  })
  .nullable()
  .optional();

// Social media schema
const socialMediaSchema = z
  .object({
    facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    youtube: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    tiktok: z.string().url('Invalid TikTok URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    whatsapp: z.string().optional().or(z.literal('')),
  })
  .optional();

// Service schedule schema
const serviceScheduleSchema = z.object({
  day: z.enum([
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  type: z.enum([
    'main_service',
    'bible_study',
    'prayer_meeting',
    'youth_meeting',
    'women_meeting',
    'men_meeting',
    'children_service',
    'worship_night',
    'special_service',
  ]),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  isActive: z.boolean().optional(),
});

// Church level enum
const churchLevelSchema = z.enum([
  'headquarters',
  'country',
  'department',
  'province',
  'local',
]);

// Church status enum
const churchStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended']);

// Main church form schema
export const churchFormSchema = z.object({
  // Basic info
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name is too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  level: churchLevelSchema,
  parentChurchId: z.string().nullable().optional(),
  isHeadquarters: z.boolean(),
  isFeatured: z.boolean(),

  // Location
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().min(2, 'Country code is required').max(3, 'Invalid country code'),
  department: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  coordinates: coordinatesSchema,

  // Contact
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  socialMedia: socialMediaSchema,

  // Content
  description: localizedStringRequiredSchema,
  history: localizedStringSchema.optional(),
  foundationDate: z.string().optional().or(z.literal('')),
  serviceSchedule: z.array(serviceScheduleSchema).optional(),
  coverImage: z.string().url('Invalid image URL').nullable().optional(),
  logoImage: z.string().url('Invalid image URL').nullable().optional(),

  // Status
  status: churchStatusSchema,
});

// Type inference
export type ChurchFormData = z.infer<typeof churchFormSchema>;

// Default values for form
export const defaultChurchFormValues: ChurchFormData = {
  name: '',
  slug: '',
  level: 'local',
  parentChurchId: null,
  isHeadquarters: false,
  isFeatured: false,
  country: 'Bolivia',
  countryCode: 'BO',
  department: '',
  province: '',
  city: '',
  address: '',
  coordinates: null,
  phone: '',
  email: '',
  website: '',
  socialMedia: {},
  description: { es: '', en: '', pt: '' },
  history: { es: '', en: '', pt: '' },
  foundationDate: '',
  serviceSchedule: [],
  coverImage: null,
  logoImage: null,
  status: 'active',
};

export default churchFormSchema;
