/**
 * Sermon Types
 *
 * Types for sermons, sermon series, and media content.
 */

import {
  LocalizedString,
  Resource,
  Timestamp,
  WithTimestamps,
} from './common.types';

// ============================================
// ENUMS & LITERALS
// ============================================

/**
 * Sermon categories
 */
export type SermonCategory =
  | 'faith'           // Fe
  | 'community'       // Comunidad
  | 'grace'           // Gracia
  | 'holy_spirit'     // Espíritu Santo
  | 'purpose'         // Propósito
  | 'prayer'          // Oración
  | 'family'          // Familia
  | 'leadership'      // Liderazgo
  | 'salvation'       // Salvación
  | 'discipleship'    // Discipulado
  | 'worship'         // Adoración
  | 'evangelism'      // Evangelismo
  | 'stewardship'     // Mayordomía
  | 'healing'         // Sanidad
  | 'prophecy'        // Profecía
  | 'end_times'       // Tiempos finales
  | 'relationships'   // Relaciones
  | 'character'       // Carácter
  | 'other';          // Otro

// ============================================
// SERMON DOCUMENT
// ============================================

/**
 * Sermon base data (without ID and timestamps)
 */
export interface SermonData {
  // Basic info
  title: LocalizedString;
  slug: string;
  description: LocalizedString;

  // Church reference
  churchId: string;
  churchName: string;

  // Speaker
  speakerName: string;
  speakerId?: string;
  speakerPhotoURL?: string;

  // Content
  category: SermonCategory;
  date: string;  // ISO date string
  duration: number;  // minutes
  scripture: string;  // e.g., "Hebreos 11:1-6"

  // Media URLs
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  youtubeId: string | null;

  // Attachments
  resources: Resource[];

  // Notes/outline
  notes: LocalizedString;
  outline?: LocalizedString;
  transcript?: LocalizedString;

  // Metadata
  tags: string[];
  viewCount: number;
  likeCount?: number;

  // Series (optional)
  seriesId?: string;
  seriesName?: string;
  seriesOrder?: number;

  // Status
  isPublished: boolean;
  isFeatured: boolean;
}

/**
 * Full Sermon document (with ID and timestamps)
 */
export interface Sermon extends SermonData, WithTimestamps {
  id: string;
  createdBy?: string;
  publishedAt?: Timestamp;
}

/**
 * Sermon for creation
 */
export type SermonCreateInput = Omit<SermonData, 'viewCount' | 'likeCount'> & {
  viewCount?: number;
  likeCount?: number;
};

/**
 * Sermon for update
 */
export type SermonUpdateInput = Partial<SermonData> & { id: string };

// ============================================
// SERMON SERIES
// ============================================

/**
 * Sermon series data
 */
export interface SermonSeriesData {
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  churchId: string;
  coverImage: string | null;
  sermonCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured: boolean;
}

/**
 * Full SermonSeries document
 */
export interface SermonSeries extends SermonSeriesData, WithTimestamps {
  id: string;
  sermons?: Sermon[];  // Populated when needed
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Sermon list query filters
 */
export interface SermonQueryFilters {
  page?: number;
  limit?: number;
  churchId?: string;
  category?: SermonCategory;
  speakerName?: string;
  speakerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  seriesId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

// ============================================
// SERMON SUMMARY (for lists)
// ============================================

/**
 * Lightweight sermon for listings
 */
export interface SermonSummary {
  id: string;
  title: LocalizedString;
  slug: string;
  churchId: string;
  churchName: string;
  speakerName: string;
  category: SermonCategory;
  date: string;
  duration: number;
  thumbnailUrl: string | null;
  youtubeId: string | null;
  viewCount: number;
  isFeatured: boolean;
}

// ============================================
// SERMON ENGAGEMENT
// ============================================

/**
 * Sermon view/like tracking
 */
export interface SermonEngagement {
  sermonId: string;
  userId: string;
  viewed: boolean;
  viewedAt?: Timestamp;
  liked: boolean;
  likedAt?: Timestamp;
  watchProgress?: number;  // percentage 0-100
  lastWatchedAt?: Timestamp;
}
