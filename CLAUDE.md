# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cristo Es La Respuesta - Firebase Migration** - A multi-church platform for a church network with locations across Bolivia and other South American countries. This is the Firebase-based version of the platform, migrated from Auth0 + MongoDB + Express.js to a fully serverless Firebase architecture.

## Tech Stack

- **Authentication**: Firebase Auth with Custom Claims
- **Database**: Cloud Firestore (NoSQL)
- **Backend**: Firebase Cloud Functions (Serverless, Express.js)
- **Frontend**: React + Vite + Redux Toolkit + RTK Query + Atomic Design
- **File Storage**: Cloudinary (primary) + Firebase Storage (backup)
- **Hosting**: Firebase Hosting with CDN
- **i18n**: react-i18next (ES, EN, PT)
- **UI**: Material-UI v5

## Development Commands

### Functions (from `/functions`)
```bash
npm run build        # Build functions
npm run serve        # Start functions emulator
npm run deploy       # Deploy to Firebase
npm run logs         # View function logs
npm run seed         # Seed all data (skips if data exists)
npm run seed:force   # Force reseed: clear all data and reseed fresh
npm run seed:clear   # Clear all seeded data without reseeding
npm run seed:churches # Seed only churches
npm run seed:users   # Seed only users
```

### Frontend (from `/frontend`)
```bash
npm run dev          # Vite dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
```

### Firebase CLI (from root)
```bash
firebase emulators:start                    # Start all emulators
firebase emulators:start --import=./emulator-data --export-on-exit  # With data persistence
firebase deploy                             # Deploy all
firebase deploy --only functions            # Deploy functions only
firebase deploy --only hosting              # Deploy hosting only
firebase deploy --only firestore:rules      # Deploy Firestore rules
firebase deploy --only storage              # Deploy storage rules
```

### Docker (from root)
```bash
docker-compose up -d                        # Start all services
docker-compose up firebase-emulators -d     # Start emulators only
docker-compose exec firebase-emulators npm run seed --prefix functions  # Seed via Docker
docker-compose down -v                      # Stop and remove volumes
```

## Architecture

### Backend (Cloud Functions)
- **Pattern**: Routes → Services → Firestore
- **Auth**: Firebase Auth token verification via middleware
- **Permissions**: Custom claims for system roles and church-specific roles
- **Response format**: All responses via `utils/response.utils.js`
- **Error handling**: Custom errors caught by error middleware

### Frontend (React/Vite)
- **UI**: Material-UI v5 with custom theme (`src/theme/index.js`)
- **Components**: Atomic Design (atoms → molecules → organisms → templates → pages)
- **State**: Redux Toolkit for global state, RTK Query for API calls
- **i18n**: react-i18next with 3 languages (ES/EN/PT) in `public/locales/`
- **Auth**: Custom `useAuth` hook with Firebase Auth
- **PWA**: vite-plugin-pwa with offline support

### Multi-Church System
Churches have hierarchical levels: `headquarters` → `country` → `department` → `province` → `local`

Key collections:
- `users` - User profiles with `churchMemberships[]` containing per-church roles
- `churches` - Church hierarchy with subcollections: `leadership/`, `members/`
- `events` - Events with subcollection: `registrations/`
- `sermons` - Sermon library
- `ministries` - Ministry information
- `questions` / `questionCategories` - Registration questionnaire

Church-specific roles: `admin`, `pastor`, `leader`, `staff`, `member`, `visitor`
System-wide roles: `system_admin`, `user`

## Key Patterns

### Adding a New API Endpoint
1. Add route in `functions/src/api/{resource}.routes.js`
2. Add business logic in `functions/src/services/{resource}.service.js`
3. Register route in `functions/src/api/index.js`
4. Update Firestore security rules if needed
5. Create RTK Query endpoint in `frontend/src/store/api/{resource}Api.js`

### Adding a New Component (Atomic Design)
1. **Atoms**: Basic UI elements wrapping MUI - `components/atoms/`
2. **Molecules**: Combinations of atoms - `components/molecules/`
3. **Organisms**: Complex components - `components/organisms/`
4. **Templates**: Page layouts - `components/templates/`
5. **Pages**: Full pages with data fetching - `components/pages/`

### Adding Translations
Add keys to all 3 locale files:
- `frontend/public/locales/es/common.json`
- `frontend/public/locales/en/common.json`
- `frontend/public/locales/pt/common.json`

### Cloudinary Uploads
Use helper in functions:
```javascript
const { uploadImage } = require('../utils/cloudinary.utils');
const result = await uploadImage(buffer, { folder: 'churches/logos', width: 400 });
```

## Important Files

- `firestore.rules` - Firestore security rules
- `storage.rules` - Cloud Storage security rules
- `firestore.indexes.json` - Composite indexes
- `functions/src/triggers/auth.triggers.js` - User creation trigger (sets default claims)
- `frontend/src/store/api/baseApi.js` - RTK Query base configuration with Firebase auth
- `frontend/src/hooks/useAuth.js` - Firebase auth hook

## Environment Variables

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:5001/project-id/region/api
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Functions (.env)
```
FIREBASE_PROJECT_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Test Users (Development)

| Email | Password | Role |
|-------|----------|------|
| admin@ceslar.org | Admin123! | system_admin |
| pastor@ceslar.org | Pastor123! | pastor (headquarters) |
| member@ceslar.org | Member123! | member |

## Emulator Ports

| Service | Port |
|---------|------|
| Emulator UI | 4000 |
| Functions | 5001 |
| Firestore | 8080 |
| Auth | 9099 |
| Storage | 9199 |
| Pub/Sub | 8085 |

## Related Documentation

- `firebase-migration/PROJECT-PLAN.md` - Migration timeline and phases
- `firebase-migration/ARCHITECTURE-DECISIONS.md` - Technical decisions (ADRs)
- `firebase-migration/ATOMIC-DESIGN-ARCHITECTURE.md` - Component structure
- `firebase-migration/REDUX-RTK-QUERY-GUIDE.md` - State management
- `firebase-migration/FIRESTORE-DATA-MODELS.md` - Database schema
- `firebase-migration/SEEDERS-GUIDE.md` - Data seeding
- `firebase-migration/DEVELOPMENT-GUIDE.md` - Development standards
