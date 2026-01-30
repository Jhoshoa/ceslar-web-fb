/**
 * Ministry Types
 *
 * Types for church ministries and their activities.
 */
import { LocalizedString, DayOfWeek, Frequency, Timestamp, WithTimestamps } from './common.types';
/**
 * Ministry types
 */
export type MinistryType = 'youth' | 'women' | 'men' | 'children' | 'worship' | 'prayer' | 'outreach' | 'discipleship' | 'hospitality' | 'missions' | 'social_action' | 'marriage' | 'seniors' | 'media' | 'education' | 'other';
/**
 * Ministry scope/reach
 */
export type MinistryScope = 'local' | 'regional' | 'national' | 'international';
/**
 * Ministry meeting schedule
 */
export interface MeetingSchedule {
    day: DayOfWeek;
    time: string;
    endTime: string;
    frequency: Frequency;
    location?: string;
    isOnline?: boolean;
    onlineUrl?: string;
}
/**
 * Ministry base data (without ID and timestamps)
 */
export interface MinistryData {
    name: LocalizedString;
    slug: string;
    description: LocalizedString;
    churchId: string;
    churchName: string;
    type: MinistryType;
    scope: MinistryScope;
    leaderName: string;
    leaderId?: string;
    leaderPhotoURL?: string;
    coLeaders: string[];
    coLeaderIds?: string[];
    meetingSchedule?: MeetingSchedule;
    coverImage: string | null;
    galleryImages?: string[];
    contactEmail?: string;
    contactPhone?: string;
    memberCount: number;
    isActive: boolean;
    isFeatured?: boolean;
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
export type MinistryUpdateInput = Partial<MinistryData> & {
    id: string;
};
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
//# sourceMappingURL=ministry.types.d.ts.map