/**
 * Sermon Types
 *
 * Types for sermons, sermon series, and media content.
 */
import { LocalizedString, Resource, Timestamp, WithTimestamps } from './common.types';
/**
 * Sermon categories
 */
export type SermonCategory = 'faith' | 'community' | 'grace' | 'holy_spirit' | 'purpose' | 'prayer' | 'family' | 'leadership' | 'salvation' | 'discipleship' | 'worship' | 'evangelism' | 'stewardship' | 'healing' | 'prophecy' | 'end_times' | 'relationships' | 'character' | 'other';
/**
 * Sermon base data (without ID and timestamps)
 */
export interface SermonData {
    title: LocalizedString;
    slug: string;
    description: LocalizedString;
    churchId: string;
    churchName: string;
    speakerName: string;
    speakerId?: string;
    speakerPhotoURL?: string;
    category: SermonCategory;
    date: string;
    duration: number;
    scripture: string;
    videoUrl: string | null;
    audioUrl: string | null;
    thumbnailUrl: string | null;
    youtubeId: string | null;
    resources: Resource[];
    notes: LocalizedString;
    outline?: LocalizedString;
    transcript?: LocalizedString;
    tags: string[];
    viewCount: number;
    likeCount?: number;
    seriesId?: string;
    seriesName?: string;
    seriesOrder?: number;
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
export type SermonUpdateInput = Partial<SermonData> & {
    id: string;
};
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
    sermons?: Sermon[];
}
/**
 * Sermon list query filters
 */
export interface SermonQueryFilters {
    page?: number;
    limit?: number;
    churchId?: string;
    category?: SermonCategory;
    speakerName?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    seriesId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    tags?: string[];
}
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
    watchProgress?: number;
    lastWatchedAt?: Timestamp;
}
//# sourceMappingURL=sermon.types.d.ts.map