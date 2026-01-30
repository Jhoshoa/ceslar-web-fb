/**
 * Church Types
 *
 * Types for church hierarchy, leadership, and members.
 */
import { LocalizedString, Coordinates, SocialMedia, DayOfWeek, Timestamp, WithTimestamps } from './common.types';
/**
 * Church hierarchy levels
 */
export type ChurchLevel = 'headquarters' | 'country' | 'department' | 'province' | 'local';
/**
 * Church status
 */
export type ChurchStatus = 'active' | 'inactive' | 'pending' | 'suspended';
/**
 * Church service types
 */
export type ServiceType = 'main_service' | 'bible_study' | 'prayer_meeting' | 'youth_meeting' | 'women_meeting' | 'men_meeting' | 'children_service' | 'worship_night' | 'special_service';
/**
 * Church roles (for members)
 */
export type ChurchRole = 'admin' | 'pastor' | 'leader' | 'staff' | 'member' | 'visitor';
/**
 * Church service schedule entry
 */
export interface ServiceSchedule {
    day: DayOfWeek;
    time: string;
    endTime: string;
    type: ServiceType;
    name: LocalizedString;
    description?: LocalizedString;
    isActive?: boolean;
}
/**
 * Church statistics
 */
export interface ChurchStats {
    memberCount: number;
    eventCount: number;
    sermonCount: number;
    ministryCount?: number;
}
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
    country: string;
    countryCode: string;
    department?: string;
    province?: string;
    city: string;
    address: string;
    coordinates?: Coordinates;
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: SocialMedia;
    description: LocalizedString;
    serviceSchedule?: ServiceSchedule[];
    coverImage?: string | null;
    logoImage?: string | null;
    status: ChurchStatus;
    stats: ChurchStats;
}
/**
 * Full Church document (with ID and timestamps)
 */
export interface Church extends ChurchData, WithTimestamps {
    id: string;
    leadership?: ChurchLeadership[];
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
export type ChurchUpdateInput = Partial<ChurchData> & {
    id: string;
};
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
//# sourceMappingURL=church.types.d.ts.map