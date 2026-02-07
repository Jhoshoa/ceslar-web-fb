/**
 * Event Types
 *
 * Types for church events, registrations, and attendees.
 */

import {
  LocalizedString,
  Coordinates,
  Money,
  Timestamp,
  WithTimestamps,
} from './common.types';

// ============================================
// ENUMS & LITERALS
// ============================================

/**
 * Event types
 */
export type EventType =
  | 'conference'      // Conferencia
  | 'special_event'   // Evento especial
  | 'camp'            // Campamento
  | 'workshop'        // Taller
  | 'retreat'         // Retiro
  | 'service'         // Servicio
  | 'concert'         // Concierto
  | 'outreach'        // Evangelismo
  | 'meeting'         // Reunión
  | 'training';       // Capacitación

/**
 * Event status
 */
export type EventStatus =
  | 'draft'           // Borrador
  | 'published'       // Publicado
  | 'cancelled'       // Cancelado
  | 'postponed'       // Pospuesto
  | 'completed';      // Completado

/**
 * Registration/attendee status
 */
export type AttendeeStatus =
  | 'registered'      // Registrado
  | 'confirmed'       // Confirmado
  | 'waitlist'        // Lista de espera
  | 'cancelled'       // Cancelado
  | 'attended'        // Asistió
  | 'no_show';        // No asistió

// ============================================
// EVENT LOCATION
// ============================================

/**
 * Event location information
 */
export interface EventLocation {
  name: string;
  address: string;
  city?: string;
  coordinates?: Coordinates;
  isOnline: boolean;
  onlineUrl?: string;
  onlinePlatform?: 'zoom' | 'youtube' | 'facebook' | 'google_meet' | 'other';
  instructions?: LocalizedString;
}

// ============================================
// EVENT REGISTRATION
// ============================================

/**
 * Event registration settings
 */
export interface EventRegistration {
  required: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  deadline?: string;  // ISO date string
  fee?: Money;
  requiresApproval?: boolean;
  allowWaitlist?: boolean;
  questionsRequired?: string[];  // Question IDs
}

// ============================================
// EVENT DOCUMENT
// ============================================

/**
 * Event base data (without ID and timestamps)
 */
export interface EventData {
  // Basic info
  title: LocalizedString;
  slug: string;
  description: LocalizedString;

  // Church reference
  churchId: string;
  churchName: string;
  churchSlug: string;

  // Type and status
  type: EventType;
  status: EventStatus;

  // Date and time
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  timezone: string;   // e.g., "America/La_Paz"
  isAllDay?: boolean;

  // Location
  location: EventLocation;

  // Registration
  registration: EventRegistration;

  // Media
  coverImage: string | null;
  galleryImages?: string[];

  // Visibility
  isFeatured: boolean;
  isPublic: boolean;

  // Contact
  contactEmail?: string;
  contactPhone?: string;

  // Organizer
  organizerName?: string;
  organizerId?: string;

  // Metadata
  tags?: string[];
}

/**
 * Full Event document (with ID and timestamps)
 */
export interface Event extends EventData, WithTimestamps {
  id: string;
  createdBy: string | null;
  attendees?: EventAttendee[];  // Populated from subcollection
}

/**
 * Event for creation
 */
export type EventCreateInput = Omit<EventData, 'registration'> & {
  registration?: Partial<EventRegistration>;
};

/**
 * Event for update
 */
export type EventUpdateInput = Partial<EventData> & { id: string };

// ============================================
// EVENT ATTENDEE (SUBCOLLECTION)
// ============================================

/**
 * Event attendee/registration data
 */
export interface EventAttendeeData {
  userId: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  status: AttendeeStatus;
  answers?: Record<string, string | string[]>;  // { questionId: answer }
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentReference?: string;
}

/**
 * Full EventAttendee document
 */
export interface EventAttendee extends EventAttendeeData {
  id: string;
  registeredAt: Timestamp;
  confirmedAt?: Timestamp;
  attendedAt?: Timestamp;
  cancelledAt?: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Event registration input (for registering)
 */
export interface EventRegisterInput {
  eventId: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  answers?: Record<string, string | string[]>;
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Event list query filters
 */
export interface EventQueryFilters {
  page?: number;
  limit?: number;
  churchId?: string;
  type?: EventType;
  status?: EventStatus;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  isFeatured?: boolean;
  isPublic?: boolean;
  upcoming?: boolean;
  past?: boolean;
}

// ============================================
// EVENT SUMMARY (for lists)
// ============================================

/**
 * Lightweight event for listings
 */
export interface EventSummary {
  id: string;
  title: LocalizedString;
  slug: string;
  churchId: string;
  churchName: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: Pick<EventLocation, 'name' | 'isOnline'>;
  coverImage: string | null;
  isFeatured: boolean;
  registration: Pick<EventRegistration, 'required' | 'maxAttendees' | 'currentAttendees'>;
}
