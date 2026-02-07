/**
 * Ministry Types
 *
 * Types for church ministries and their activities.
 */

import {
  LocalizedString,
  DayOfWeek,
  Frequency,
  Timestamp,
  WithTimestamps,
} from './common.types';

// ============================================
// ENUMS & LITERALS
// ============================================

/**
 * Ministry types
 */
export type MinistryType =
  | 'youth'           // Ministerio de jóvenes
  | 'women'           // Ministerio de mujeres
  | 'men'             // Ministerio de varones
  | 'children'        // Ministerio de niños
  | 'worship'         // Ministerio de alabanza
  | 'prayer'          // Ministerio de oración
  | 'outreach'        // Ministerio de evangelismo
  | 'discipleship'    // Ministerio de discipulado
  | 'hospitality'     // Ministerio de hospitalidad
  | 'missions'        // Ministerio de misiones
  | 'social_action'   // Acción social
  | 'marriage'        // Ministerio de matrimonios
  | 'seniors'         // Ministerio de adultos mayores
  | 'media'           // Ministerio de medios
  | 'education'       // Ministerio de educación
  | 'other';          // Otro

/**
 * Ministry scope/reach
 */
export type MinistryScope =
  | 'local'           // Solo iglesia local
  | 'regional'        // Regional (departamento/provincia)
  | 'national'        // Nacional
  | 'international';  // Internacional

// ============================================
// MEETING SCHEDULE
// ============================================

/**
 * Ministry meeting schedule
 */
export interface MeetingSchedule {
  day: DayOfWeek;
  time: string;        // "HH:mm" format
  endTime: string;     // "HH:mm" format
  frequency: Frequency;
  location?: string;
  isOnline?: boolean;
  onlineUrl?: string;
}

// ============================================
// MINISTRY DOCUMENT
// ============================================

/**
 * Ministry base data (without ID and timestamps)
 */
export interface MinistryData {
  // Basic info
  name: LocalizedString;
  slug: string;
  description: LocalizedString;

  // Church reference
  churchId: string;
  churchName: string;

  // Type and scope
  type: MinistryType;
  scope: MinistryScope;

  // Leadership
  leaderName: string;
  leaderId?: string;
  leaderPhotoURL?: string;
  coLeaders: string[];  // Display names
  coLeaderIds?: string[];  // User IDs

  // Schedule
  meetingSchedule?: MeetingSchedule;

  // Media
  coverImage: string | null;
  galleryImages?: string[];

  // Contact
  contactEmail?: string;
  contactPhone?: string;

  // Stats
  memberCount: number;

  // Status
  isActive: boolean;
  isFeatured?: boolean;

  // Additional info
  mission?: LocalizedString;
  vision?: LocalizedString;
  requirements?: LocalizedString;
  ageRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Full Ministry document (with ID and timestamps)
 */
export interface Ministry extends MinistryData, WithTimestamps {
  id: string;
  createdBy?: string;
}

/**
 * Ministry for creation
 */
export type MinistryCreateInput = Omit<MinistryData, 'memberCount'> & {
  memberCount?: number;
};

/**
 * Ministry for update
 */
export type MinistryUpdateInput = Partial<MinistryData> & { id: string };

// ============================================
// MINISTRY MEMBER
// ============================================

/**
 * Ministry member role
 */
export type MinistryMemberRole = 'leader' | 'co_leader' | 'coordinator' | 'member';

/**
 * Ministry member data
 */
export interface MinistryMemberData {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: MinistryMemberRole;
  isActive: boolean;
}

/**
 * Full MinistryMember document
 */
export interface MinistryMember extends MinistryMemberData {
  id: string;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Ministry list query filters
 */
export interface MinistryQueryFilters {
  page?: number;
  limit?: number;
  churchId?: string;
  type?: MinistryType;
  scope?: MinistryScope;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

// ============================================
// MINISTRY SUMMARY (for lists)
// ============================================

/**
 * Lightweight ministry for listings
 */
export interface MinistrySummary {
  id: string;
  name: LocalizedString;
  slug: string;
  churchId: string;
  churchName: string;
  type: MinistryType;
  leaderName: string;
  memberCount: number;
  coverImage: string | null;
  meetingSchedule?: Pick<MeetingSchedule, 'day' | 'time' | 'frequency'>;
  isActive: boolean;
}
