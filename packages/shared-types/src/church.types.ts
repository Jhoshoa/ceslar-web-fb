/**
 * Church Types
 *
 * Types for church hierarchy, leadership, and members.
 */

import {
  LocalizedString,
  Coordinates,
  SocialMedia,
  DayOfWeek,
  Timestamp,
  WithTimestamps,
} from './common.types';

// ============================================
// ENUMS & LITERALS
// ============================================

/**
 * Church hierarchy levels
 */
export type ChurchLevel =
  | 'headquarters'   // Sede internacional
  | 'country'        // País
  | 'department'     // Departamento
  | 'province'       // Provincia
  | 'local';         // Iglesia local

/**
 * Church status
 */
export type ChurchStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Church service types
 */
export type ServiceType =
  | 'main_service'      // Servicio dominical
  | 'bible_study'       // Estudio bíblico
  | 'prayer_meeting'    // Reunión de oración
  | 'youth_meeting'     // Reunión de jóvenes
  | 'women_meeting'     // Reunión de mujeres
  | 'men_meeting'       // Reunión de varones
  | 'children_service'  // Servicio de niños
  | 'worship_night'     // Noche de alabanza
  | 'special_service';  // Servicio especial

/**
 * Church roles (for members)
 */
export type ChurchRole =
  | 'admin'     // Administrator
  | 'pastor'    // Pastor
  | 'leader'    // Líder
  | 'staff'     // Personal
  | 'member'    // Miembro
  | 'visitor';  // Visitante

// ============================================
// SERVICE SCHEDULE
// ============================================

/**
 * Church service schedule entry
 */
export interface ServiceSchedule {
  day: DayOfWeek;
  time: string;        // "HH:mm" format
  endTime: string;     // "HH:mm" format
  type: ServiceType;
  name: LocalizedString;
  description?: LocalizedString;
  isActive?: boolean;
}

// ============================================
// CHURCH STATS
// ============================================

/**
 * Church statistics
 */
export interface ChurchStats {
  memberCount: number;
  eventCount: number;
  sermonCount: number;
  ministryCount?: number;
}

// ============================================
// CHURCH DOCUMENT
// ============================================

/**
 * Church base data (without ID and timestamps)
 */
export interface ChurchData {
  name: string;
  slug: string;
  level: ChurchLevel;
  parentChurchId: string | null;
  isHeadquarters: boolean;
  isFeatured: boolean;

  // Location
  country: string;
  countryCode: string;
  department?: string;
  province?: string;
  city: string;
  address: string;
  coordinates?: Coordinates;

  // Contact
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: SocialMedia;

  // Content
  description: LocalizedString;
  history?: LocalizedString;
  foundationDate?: string;
  serviceSchedule?: ServiceSchedule[];
  coverImage?: string | null;
  logoImage?: string | null;

  // Status
  status: ChurchStatus;
  stats: ChurchStats;
}

/**
 * Full Church document (with ID and timestamps)
 */
export interface Church extends ChurchData, WithTimestamps {
  id: string;
  leadership?: ChurchLeadership[];  // Populated from subcollection
}

/**
 * Church for creation (without generated fields)
 */
export type ChurchCreateInput = Omit<ChurchData, 'stats'> & {
  stats?: Partial<ChurchStats>;
};

/**
 * Church for update (all fields optional except id)
 */
export type ChurchUpdateInput = Partial<ChurchData> & { id: string };

// ============================================
// CHURCH LEADERSHIP
// ============================================

/**
 * Church leadership entry (subcollection)
 */
export interface ChurchLeadershipData {
  userId: string | null;
  displayName: string;
  role: ChurchRole;
  title: LocalizedString;
  order: number;
  isActive: boolean;
  photoURL?: string | null;
  bio?: LocalizedString;
}

/**
 * Full ChurchLeadership document
 */
export interface ChurchLeadership extends ChurchLeadershipData, WithTimestamps {
  id: string;
}

// ============================================
// CHURCH MEMBER
// ============================================

/**
 * Membership status
 */
export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

/**
 * Church member entry (subcollection)
 */
export interface ChurchMemberData {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: ChurchRole;
  status: MembershipStatus;
}

/**
 * Full ChurchMember document
 */
export interface ChurchMember extends ChurchMemberData {
  id: string;
  joinedAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string;
  updatedAt: Timestamp;
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Church list query filters
 */
export interface ChurchQueryFilters {
  page?: number;
  limit?: number;
  country?: string;
  department?: string;
  city?: string;
  level?: ChurchLevel;
  status?: ChurchStatus;
  search?: string;
  parentChurchId?: string;
  isFeatured?: boolean;
}

/**
 * Church grouped by location
 */
export interface ChurchGroupedByCountry {
  country: string;
  countryCode: string;
  churches: Church[];
  count: number;
}
