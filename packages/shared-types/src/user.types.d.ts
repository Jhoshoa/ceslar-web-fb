/**
 * User Types
 *
 * Types for user profiles, authentication, and memberships.
 */
import { Timestamp, Language, ThemeMode, WithTimestamps } from './common.types';
import { ChurchRole, MembershipStatus } from './church.types';
/**
 * System-wide roles
 */
export type SystemRole = 'system_admin' | 'admin' | 'user';
/**
 * Permission strings
 */
export type Permission = 'read:public' | 'read:all' | 'write:own' | 'write:church' | 'write:all' | 'delete:own' | 'delete:church' | 'delete:all' | 'manage:members' | 'manage:events' | 'manage:sermons' | 'manage:ministries' | 'admin:all';
/**
 * User notification preferences
 */
export interface NotificationPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications?: boolean;
    newsletter: boolean;
}
/**
 * User display preferences
 */
export interface DisplayPreferences {
    language: Language;
    theme: ThemeMode;
    reducedMotion?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
}
/**
 * Full user preferences
 */
export interface UserPreferences extends NotificationPreferences, DisplayPreferences {
}
/**
 * User's membership in a church
 */
export interface UserChurchMembership {
    churchId: string;
    churchName: string;
    churchSlug: string;
    role: ChurchRole;
    status: MembershipStatus;
    joinedAt?: Timestamp;
    approvedAt?: Timestamp;
}
/**
 * User's answer to a registration question
 */
export interface RegistrationAnswer {
    questionId: string;
    questionText?: string;
    answer: string | string[];
    answeredAt: Timestamp;
}
/**
 * User base data (without ID and timestamps)
 */
export interface UserData {
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    photoURL: string | null;
    phoneNumber: string | null;
    systemRole: SystemRole;
    churchMemberships: UserChurchMembership[];
    registrationAnswers: RegistrationAnswer[];
    preferences: UserPreferences;
    isActive: boolean;
    emailVerified: boolean;
}
/**
 * Full User document (with ID and timestamps)
 */
export interface User extends UserData, WithTimestamps {
    id: string;
    lastLoginAt?: Timestamp;
}
/**
 * User for creation (partial)
 */
export type UserCreateInput = Pick<UserData, 'email' | 'displayName'> & Partial<Omit<UserData, 'email' | 'displayName'>>;
/**
 * User for update (all fields optional)
 */
export type UserUpdateInput = Partial<UserData>;
/**
 * User profile update (limited fields)
 */
export interface UserProfileUpdateInput {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string | null;
    preferences?: Partial<UserPreferences>;
}
/**
 * Firebase Auth user data
 */
export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    phoneNumber: string | null;
}
/**
 * Firebase Auth custom claims
 */
export interface UserClaims {
    systemRole: SystemRole;
    churchRoles: Record<string, ChurchRole>;
    permissions: Permission[];
    createdAt?: string;
}
/**
 * Combined auth user with claims and Firestore data
 */
export interface AuthenticatedUser extends AuthUser {
    systemRole: SystemRole;
    churchRoles: Record<string, ChurchRole>;
    permissions: Permission[];
}
/**
 * Authentication state
 */
export interface AuthState {
    user: AuthenticatedUser | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    loading: boolean;
    error: string | null;
}
/**
 * User list query filters
 */
export interface UserQueryFilters {
    page?: number;
    limit?: number;
    search?: string;
    systemRole?: SystemRole;
    isActive?: boolean;
    churchId?: string;
    churchRole?: ChurchRole;
}
/**
 * Assign church role input
 */
export interface AssignChurchRoleInput {
    userId: string;
    churchId: string;
    role: ChurchRole;
}
/**
 * Update system role input
 */
export interface UpdateSystemRoleInput {
    userId: string;
    systemRole: SystemRole;
}
//# sourceMappingURL=user.types.d.ts.map