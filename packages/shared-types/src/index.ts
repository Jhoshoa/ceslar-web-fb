/**
 * @ceslar/shared-types
 *
 * Shared TypeScript types for the CESLAR Firebase project.
 * Used by both frontend (React) and backend (Firebase Functions).
 */

// ============================================
// COMMON TYPES
// ============================================
export type {
  // Firebase
  Timestamp,
  ServerTimestamp,
  // Localization
  Language,
  LocalizedString,
  PartialLocalizedString,
  // Geographic
  Coordinates,
  Address,
  // Time & Scheduling
  DayOfWeek,
  Frequency,
  TimeRange,
  // Social Media
  SocialMedia,
  // Contact
  ContactInfo,
  // Media
  ImageInfo,
  ResourceType,
  Resource,
  // Currency
  CurrencyCode,
  Money,
  // Theme
  ThemeMode,
  // Utility types
  PartialBy,
  RequiredBy,
  WithId,
  WithTimestamps,
  FirestoreDocument,
} from './common.types';

// ============================================
// CHURCH TYPES
// ============================================
export type {
  // Enums
  ChurchLevel,
  ChurchStatus,
  ServiceType,
  ChurchRole,
  MembershipStatus,
  // Interfaces
  ServiceSchedule,
  ChurchStats,
  ChurchData,
  Church,
  ChurchCreateInput,
  ChurchUpdateInput,
  ChurchLeadershipData,
  ChurchLeadership,
  ChurchMemberData,
  ChurchMember,
  ChurchQueryFilters,
  ChurchGroupedByCountry,
} from './church.types';

// ============================================
// USER TYPES
// ============================================
export type {
  // Enums
  SystemRole,
  Permission,
  // Interfaces
  NotificationPreferences,
  DisplayPreferences,
  UserPreferences,
  UserChurchMembership,
  RegistrationAnswer,
  UserData,
  User,
  UserCreateInput,
  UserUpdateInput,
  UserProfileUpdateInput,
  AuthUser,
  UserClaims,
  AuthenticatedUser,
  AuthState,
  UserQueryFilters,
  AssignChurchRoleInput,
  UpdateSystemRoleInput,
} from './user.types';

// ============================================
// EVENT TYPES
// ============================================
export type {
  // Enums
  EventType,
  EventStatus,
  AttendeeStatus,
  // Interfaces
  EventLocation,
  EventRegistration,
  EventData,
  Event,
  EventCreateInput,
  EventUpdateInput,
  EventAttendeeData,
  EventAttendee,
  EventRegisterInput,
  EventQueryFilters,
  EventSummary,
} from './event.types';

// ============================================
// SERMON TYPES
// ============================================
export type {
  // Enums
  SermonCategory,
  // Interfaces
  SermonData,
  Sermon,
  SermonCreateInput,
  SermonUpdateInput,
  SermonSeriesData,
  SermonSeries,
  SermonQueryFilters,
  SermonSummary,
  SermonEngagement,
} from './sermon.types';

// ============================================
// MINISTRY TYPES
// ============================================
export type {
  // Enums
  MinistryType,
  MinistryScope,
  MinistryMemberRole,
  // Interfaces
  MeetingSchedule,
  MinistryData,
  Ministry,
  MinistryCreateInput,
  MinistryUpdateInput,
  MinistryMemberData,
  MinistryMember,
  MinistryQueryFilters,
  MinistrySummary,
} from './ministry.types';

// ============================================
// QUESTION TYPES
// ============================================
export type {
  // Enums
  QuestionType,
  TargetAudience,
  QuestionScope,
  // Interfaces
  QuestionOptionLabels,
  QuestionOption,
  QuestionValidation,
  QuestionCategoryData,
  QuestionCategory,
  QuestionCategoryCreateInput,
  QuestionCategoryUpdateInput,
  QuestionData,
  Question,
  QuestionCreateInput,
  QuestionUpdateInput,
  AnswerValue,
  QuestionAnswer,
  RegistrationAnswers,
  QuestionQueryFilters,
  QuestionCategoryFilters,
  QuestionsGroupedByCategory,
  RegistrationForm,
} from './question.types';

// ============================================
// API TYPES
// ============================================
export type {
  // Pagination
  PaginationInfo,
  PaginationParams,
  // Responses
  ApiResponseBase,
  ApiResponse,
  PaginatedApiResponse,
  ApiMutationResponse,
  ApiEmptyResponse,
  // Errors
  ApiErrorCode,
  ApiErrorDetails,
  ApiErrorResponse,
  ValidationErrorResponse,
  // Request types
  SortDirection,
  BaseQueryParams,
  IdParam,
  SlugParam,
  // RTK Query helpers
  TagType,
  Tag,
  ExtractData,
  ExtractPaginatedData,
  // HTTP
  HttpMethod,
  HttpStatusCode,
  // Request context
  RequestContext,
  AuthenticatedRequest,
} from './api.types';
