# TypeScript Migration Plan

## Executive Summary

This document provides a comprehensive analysis and migration plan for converting the CESLAR Firebase project from JavaScript to TypeScript. The migration will introduce strong typing across both the frontend (React/Vite) and backend (Firebase Functions), enabling better code quality, IDE support, and maintainability.

---

## Current State Analysis

### Project Structure

```
ceslar-web-firebase/
├── frontend/                    # React + Vite + Redux Toolkit
│   └── src/
│       ├── components/          # Atomic Design (atoms, molecules, organisms, templates, pages)
│       ├── store/               # Redux + RTK Query
│       ├── hooks/               # Custom hooks (useAuth, etc.)
│       ├── guards/              # Route guards
│       └── config/              # Firebase config
│
└── functions/                   # Firebase Cloud Functions
    └── src/
        ├── api/                 # Express routes
        ├── services/            # Business logic
        ├── middleware/          # Auth, permissions
        ├── seeders/             # Data seeding
        └── utils/               # Utilities
```

### Files to Migrate

| Layer | File Count | Priority |
|-------|------------|----------|
| **Frontend Components** | ~80 files | High |
| **Frontend Store (RTK Query)** | ~10 files | High |
| **Frontend Hooks** | ~5 files | High |
| **Backend Services** | 8 files | High |
| **Backend Routes** | 9 files | Medium |
| **Backend Middleware** | 3 files | Medium |
| **Seeders** | 7 files | Low |

---

## Data Models Identified

### 1. Church Model

```typescript
// Enums
type ChurchLevel = 'headquarters' | 'country' | 'department' | 'province' | 'local';
type ChurchStatus = 'active' | 'inactive' | 'pending';
type ServiceType = 'main_service' | 'bible_study' | 'prayer_meeting' | 'youth_meeting';
type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

// Interfaces
interface LocalizedString {
  es: string;
  en: string;
  pt: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

interface ServiceSchedule {
  day: DayOfWeek;
  time: string;        // "HH:mm" format
  endTime: string;     // "HH:mm" format
  type: ServiceType;
  name: LocalizedString;
}

interface ChurchStats {
  memberCount: number;
  eventCount: number;
  sermonCount: number;
}

interface Church {
  id: string;
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
  status: ChurchStatus;
  stats: ChurchStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ChurchLeadership {
  id: string;
  userId: string | null;
  displayName: string;
  role: ChurchRole;
  title: LocalizedString;
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. User Model

```typescript
// Enums
type SystemRole = 'system_admin' | 'admin' | 'user';
type ChurchRole = 'admin' | 'pastor' | 'leader' | 'staff' | 'member' | 'visitor';
type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'es' | 'en' | 'pt';

interface UserPreferences {
  language: Language;
  theme: ThemeMode;
  emailNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
}

interface ChurchMembership {
  churchId: string;
  churchName: string;
  churchSlug: string;
  role: ChurchRole;
  status: MembershipStatus;
  joinedAt?: Timestamp;
  approvedAt?: Timestamp;
}

interface User {
  id: string;  // Firebase Auth UID
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
  phoneNumber: string | null;
  systemRole: SystemRole;
  churchMemberships: ChurchMembership[];
  registrationAnswers: RegistrationAnswer[];
  preferences: UserPreferences;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// Firebase Auth Custom Claims
interface UserClaims {
  systemRole: SystemRole;
  churchRoles: Record<string, ChurchRole>;  // { churchId: role }
  permissions: string[];
}

// Church Member (subcollection)
interface ChurchMember {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: ChurchRole;
  status: MembershipStatus;
  joinedAt: Timestamp;
  approvedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Event Model

```typescript
// Enums
type EventType = 'conference' | 'special_event' | 'camp' | 'workshop' | 'retreat' | 'service';
type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

interface EventLocation {
  name: string;
  address: string;
  coordinates?: Coordinates;
  isOnline: boolean;
  onlineUrl?: string;
}

interface EventRegistrationFee {
  amount: number;
  currency: string;  // "BOB", "USD", etc.
}

interface EventRegistration {
  required: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  deadline?: string;  // ISO date string
  fee?: EventRegistrationFee;
}

interface Event {
  id: string;
  title: LocalizedString;
  slug: string;
  description: LocalizedString;
  churchId: string;
  churchName: string;
  churchSlug: string;
  type: EventType;
  status: EventStatus;
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  timezone: string;   // "America/La_Paz"
  location: EventLocation;
  registration: EventRegistration;
  coverImage: string | null;
  isFeatured: boolean;
  isPublic: boolean;
  createdBy: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Event Registration (subcollection)
interface EventAttendee {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended';
  registeredAt: Timestamp;
  confirmedAt?: Timestamp;
}
```

### 4. Sermon Model

```typescript
type SermonCategory = 'faith' | 'community' | 'grace' | 'holy_spirit' | 'purpose' | 'prayer' | 'family' | 'leadership';

interface SermonResource {
  type: 'pdf' | 'doc' | 'image' | 'link';
  name: string;
  url: string;
}

interface Sermon {
  id: string;
  title: LocalizedString;
  slug: string;
  description: LocalizedString;
  churchId: string;
  churchName: string;
  speakerName: string;
  category: SermonCategory;
  date: string;  // ISO date string
  duration: number;  // minutes
  scripture: string;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  youtubeId: string | null;
  resources: SermonResource[];
  notes: LocalizedString;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. Ministry Model

```typescript
type MinistryType = 'youth' | 'women' | 'men' | 'children' | 'worship' | 'prayer' | 'outreach' | 'discipleship';
type MinistryScope = 'local' | 'regional' | 'national' | 'international';
type MeetingFrequency = 'weekly' | 'biweekly' | 'monthly';

interface MeetingSchedule {
  day: DayOfWeek;
  time: string;
  endTime: string;
  frequency: MeetingFrequency;
}

interface Ministry {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  churchId: string;
  churchName: string;
  type: MinistryType;
  scope: MinistryScope;
  leaderName: string;
  coLeaders: string[];
  meetingSchedule?: MeetingSchedule;
  coverImage: string | null;
  contactEmail?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. Question Model

```typescript
type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';
type TargetAudience = 'all' | 'new_members' | 'visitors' | 'leaders';
type QuestionScope = 'global' | 'church';

interface QuestionOptionLabels {
  es: string;
  en: string;
  pt: string;
}

interface QuestionOption {
  value: string;
  labels: QuestionOptionLabels;
  order: number;
}

interface QuestionValidation {
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

interface QuestionCategory {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Question {
  id: string;
  categoryId: string;
  questionText: LocalizedString;
  questionType: QuestionType;
  options: QuestionOption[];
  validation: QuestionValidation;
  targetAudience: TargetAudience;
  scope: QuestionScope;
  churchId?: string;  // Only for church-specific questions
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface RegistrationAnswer {
  questionId: string;
  answer: string | string[];  // string[] for checkbox type
  answeredAt: Timestamp;
}
```

### 7. API Response Types

```typescript
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## Migration Strategy

### Phase 1: Shared Types Package (Week 1)

Create a shared types package that can be used by both frontend and backend.

```
packages/
└── shared-types/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts
        ├── church.types.ts
        ├── user.types.ts
        ├── event.types.ts
        ├── sermon.types.ts
        ├── ministry.types.ts
        ├── question.types.ts
        ├── api.types.ts
        └── common.types.ts
```

### Phase 2: Backend Migration (Week 2-3)

1. Add TypeScript configuration to `/functions`
2. Migrate services first (core business logic)
3. Migrate routes with typed request/response
4. Migrate middleware with typed context

### Phase 3: Frontend Migration (Week 3-5)

1. Add TypeScript configuration to `/frontend`
2. Migrate RTK Query APIs with typed responses
3. Migrate Redux slices
4. Migrate hooks
5. Migrate components (bottom-up: atoms → pages)

---

## File Structure After Migration

### Shared Types

```
packages/shared-types/src/
├── index.ts                 # Barrel export
├── common.types.ts          # LocalizedString, Coordinates, Timestamp
├── church.types.ts          # Church, ChurchLeadership, ChurchMember
├── user.types.ts            # User, UserClaims, UserPreferences
├── event.types.ts           # Event, EventAttendee
├── sermon.types.ts          # Sermon, SermonResource
├── ministry.types.ts        # Ministry, MeetingSchedule
├── question.types.ts        # Question, QuestionCategory, RegistrationAnswer
└── api.types.ts             # ApiResponse, PaginatedApiResponse, PaginationInfo
```

### Backend

```
functions/src/
├── types/
│   └── index.ts             # Re-export shared types + Express extensions
├── services/
│   ├── church.service.ts
│   ├── user.service.ts
│   └── ...
├── api/
│   ├── churches.routes.ts
│   └── ...
└── middleware/
    ├── auth.middleware.ts
    └── ...
```

### Frontend

```
frontend/src/
├── types/
│   └── index.ts             # Re-export shared types + frontend-specific
├── store/
│   ├── api/
│   │   ├── baseApi.ts
│   │   ├── churchesApi.ts   # Typed RTK Query
│   │   └── ...
│   └── slices/
│       ├── auth.slice.ts
│       └── ...
├── hooks/
│   ├── useAuth.ts
│   └── ...
└── components/
    └── ... (gradually migrate)
```

---

## Benefits of Migration

1. **Type Safety**: Catch errors at compile time instead of runtime
2. **IDE Support**: Better autocomplete, refactoring, and documentation
3. **Self-Documenting**: Types serve as documentation
4. **Easier Refactoring**: TypeScript catches breaking changes
5. **Shared Types**: Single source of truth for data models
6. **Better DX**: Developers can understand data shapes quickly

---

## Prompt for Claude to Execute Migration

Use this prompt to have Claude execute the TypeScript migration:

```
I need you to migrate the CESLAR Firebase project to TypeScript. Please follow the migration plan in TYPESCRIPT-MIGRATION-PLAN.md.

## Migration Order:

### Step 1: Create shared types package
Create a new `packages/shared-types/` directory with all the type definitions from the migration plan. Include:
- All interfaces and types for Church, User, Event, Sermon, Ministry, Question
- API response types
- Common types (LocalizedString, Coordinates, etc.)
- Proper barrel exports

### Step 2: Configure TypeScript for functions/
- Add tsconfig.json for Firebase Functions
- Update package.json with TypeScript dependencies
- Create types/index.ts to extend Express Request

### Step 3: Migrate backend services
Convert all files in functions/src/services/ to TypeScript:
- church.service.ts
- user.service.ts
- event.service.ts
- sermon.service.ts
- ministry.service.ts
- membership.service.ts
- question.service.ts
- auth.service.ts

### Step 4: Migrate backend routes
Convert all files in functions/src/api/ to TypeScript with typed request handlers.

### Step 5: Migrate backend middleware
Convert auth.middleware.ts and permissions.middleware.ts

### Step 6: Configure TypeScript for frontend/
- Update vite.config.ts
- Add/update tsconfig.json
- Create types/index.ts

### Step 7: Migrate frontend store
- Convert baseApi.ts with typed endpoints
- Convert all API files (churchesApi.ts, usersApi.ts, etc.)
- Convert all slices (auth.slice.ts, preferences.slice.ts, ui.slice.ts)

### Step 8: Migrate frontend hooks
- Convert useAuth.ts with proper types
- Convert any other custom hooks

### Step 9: Migrate frontend components
Start from atoms and work up to pages:
- atoms/ (Button, Input, Avatar, etc.)
- molecules/ (FormField, LanguageSwitcher, etc.)
- organisms/ (Header, Footer, UserMenu, etc.)
- templates/ (MainLayout, AdminLayout, etc.)
- pages/ (all page components)

### Step 10: Migrate guards
Convert AuthGuard, RoleGuard, GuestGuard, ChurchGuard

## Important Guidelines:
- Keep the same file structure, just change .js/.jsx to .ts/.tsx
- Use strict TypeScript configuration
- Add proper JSDoc comments where helpful
- Ensure all imports/exports are properly typed
- Test the build after each major step
- Do NOT change any business logic, only add types
```

---

## Configuration Files Needed

### functions/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib"]
}
```

### frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared-types/*": ["../packages/shared-types/src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Shared Types Package | 4-6 hours | Critical |
| Backend Services | 8-12 hours | High |
| Backend Routes | 4-6 hours | High |
| Frontend Store/APIs | 6-8 hours | High |
| Frontend Hooks | 2-3 hours | High |
| Frontend Components | 12-16 hours | Medium |
| Testing & Fixes | 4-6 hours | High |
| **Total** | **40-57 hours** | - |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Build failures | Migrate incrementally, test after each step |
| Runtime errors | Use strict mode, add runtime validation at boundaries |
| Team learning curve | Provide TypeScript guidelines, pair programming |
| Third-party types missing | Use `@types/*` packages or create declaration files |

---

## Next Steps

1. Review this migration plan
2. Set up the shared types package
3. Begin with backend migration (smaller surface area)
4. Proceed to frontend migration
5. Update CI/CD for TypeScript builds
