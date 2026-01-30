/**
 * Event Types
 *
 * Types for church events, registrations, and attendees.
 */
import { LocalizedString, Coordinates, Money, Timestamp, WithTimestamps } from './common.types';
/**
 * Event types
 */
export type EventType = 'conference' | 'special_event' | 'camp' | 'workshop' | 'retreat' | 'service' | 'concert' | 'outreach' | 'meeting' | 'training';
/**
 * Event status
 */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'postponed' | 'completed';
/**
 * Registration/attendee status
 */
export type AttendeeStatus = 'registered' | 'confirmed' | 'waitlist' | 'cancelled' | 'attended' | 'no_show';
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
/**
 * Event registration settings
 */
export interface EventRegistration {
    required: boolean;
    maxAttendees: number | null;
    currentAttendees: number;
    deadline?: string;
    fee?: Money;
    requiresApproval?: boolean;
    allowWaitlist?: boolean;
    questionsRequired?: string[];
}
/**
 * Event base data (without ID and timestamps)
 */
export interface EventData {
    title: LocalizedString;
    slug: string;
    description: LocalizedString;
    churchId: string;
    churchName: string;
    churchSlug: string;
    type: EventType;
    status: EventStatus;
    startDate: string;
    endDate: string;
    timezone: string;
    isAllDay?: boolean;
    location: EventLocation;
    registration: EventRegistration;
    coverImage: string | null;
    galleryImages?: string[];
    isFeatured: boolean;
    isPublic: boolean;
    contactEmail?: string;
    contactPhone?: string;
    organizerName?: string;
    organizerId?: string;
    tags?: string[];
}
/**
 * Full Event document (with ID and timestamps)
 */
export interface Event extends EventData, WithTimestamps {
    id: string;
    createdBy: string | null;
    attendees?: EventAttendee[];
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
export type EventUpdateInput = Partial<EventData> & {
    id: string;
};
/**
 * Event attendee/registration data
 */
export interface EventAttendeeData {
    userId: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    status: AttendeeStatus;
    answers?: Record<string, string | string[]>;
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
//# sourceMappingURL=event.types.d.ts.map