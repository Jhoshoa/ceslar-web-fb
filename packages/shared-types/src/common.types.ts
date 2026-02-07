/**
 * Common Types
 *
 * Shared types used across multiple domains.
 */

// ============================================
// FIREBASE TYPES
// ============================================

/**
 * Firebase Timestamp type
 * Can be a Firestore Timestamp, Date, or ISO string
 */
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
} | Date | string;

/**
 * Firebase Server Timestamp sentinel
 */
export type ServerTimestamp = {
  _methodName: 'serverTimestamp';
};

// ============================================
// LOCALIZATION
// ============================================

/**
 * Supported languages in the application
 */
export type Language = 'es' | 'en' | 'pt';

/**
 * Localized string with translations for all supported languages
 */
export interface LocalizedString {
  es: string;
  en: string;
  pt: string;
}

/**
 * Partial localized string (at least one language required)
 */
export type PartialLocalizedString = Partial<LocalizedString> &
  ({ es: string } | { en: string } | { pt: string });

// ============================================
// GEOGRAPHIC
// ============================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address information
 */
export interface Address {
  street?: string;
  city: string;
  department?: string;
  province?: string;
  country: string;
  countryCode: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

// ============================================
// TIME & SCHEDULING
// ============================================

/**
 * Days of the week
 */
export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/**
 * Meeting/event frequency
 */
export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Time range (HH:mm format)
 */
export interface TimeRange {
  time: string;      // "HH:mm" format
  endTime: string;   // "HH:mm" format
}

// ============================================
// SOCIAL MEDIA
// ============================================

/**
 * Social media links
 */
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

// ============================================
// CONTACT
// ============================================

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  socialMedia?: SocialMedia;
}

// ============================================
// MEDIA
// ============================================

/**
 * Image metadata
 */
export interface ImageInfo {
  url: string;
  publicId?: string;  // Cloudinary public ID
  width?: number;
  height?: number;
  format?: string;
}

/**
 * File/resource types
 */
export type ResourceType = 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'audio' | 'link';

/**
 * Generic resource/attachment
 */
export interface Resource {
  type: ResourceType;
  name: string;
  url: string;
  size?: number;  // bytes
  mimeType?: string;
}

// ============================================
// CURRENCY
// ============================================

/**
 * Currency codes (ISO 4217)
 */
export type CurrencyCode = 'BOB' | 'USD' | 'EUR' | 'BRL' | 'ARS' | 'PEN' | 'CLP';

/**
 * Money amount with currency
 */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

// ============================================
// THEME & PREFERENCES
// ============================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Document with ID (for Firestore documents)
 */
export type WithId<T> = T & { id: string };

/**
 * Document with timestamps
 */
export interface WithTimestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create type for Firestore document (with ID and timestamps)
 */
export type FirestoreDocument<T> = WithId<T & WithTimestamps>;
