# Cristo Es La Respuesta - Firebase Platform

A multi-church platform for Cristo Es La Respuesta church network, built on Firebase.

## Tech Stack

- **Frontend**: React 18 + Vite + Material-UI + Redux Toolkit + RTK Query
- **Backend**: Firebase Cloud Functions (Express.js)
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage + Cloudinary
- **Hosting**: Firebase Hosting

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (optional, for containerized development)

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Setup Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database (select `southamerica-east1` region)
4. Enable Cloud Storage
5. Upgrade to Blaze plan (required for Cloud Functions)
6. Copy Firebase config to `frontend/.env`

### 3. Configure Environment

```bash
# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your Firebase config

# Functions
cp functions/.env.example functions/.env
# Edit functions/.env with your credentials
```

### 4. Start Development

```bash
# Start Firebase emulators + frontend dev server
npm run dev

# Or start separately:
npm run emulators      # Start emulators
npm run dev:frontend   # Start frontend (in another terminal)
```

### 5. Seed Database

```bash
npm run seed  # Seeds all data (skips existing)
```

## Available Scripts

### Root Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start emulators + frontend |
| `npm run build` | Build frontend for production |
| `npm run deploy` | Deploy to Firebase |
| `npm run lint` | Run linting on all packages |
| `npm run test` | Run all tests |

### Functions Scripts (from `/functions`)

| Command | Description |
|---------|-------------|
| `npm run serve` | Start functions emulator |
| `npm run deploy` | Deploy functions |
| `npm run test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed` | Seed database (skips existing) |
| `npm run seed:force` | Clear and reseed database |
| `npm run seed:clear` | Clear seeded data |

### Frontend Scripts (from `/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |

## Project Structure

```
ceslar-web-firebase/
├── functions/           # Firebase Cloud Functions
│   ├── src/
│   │   ├── api/        # Express routes
│   │   ├── triggers/   # Auth/Firestore triggers
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Auth & validation
│   │   ├── utils/      # Helpers
│   │   └── seeders/    # Database seeders
│   └── package.json
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # Atomic Design components
│   │   ├── store/      # Redux + RTK Query
│   │   ├── hooks/      # Custom hooks
│   │   ├── guards/     # Route guards
│   │   └── ...
│   └── package.json
│
├── shared/              # Shared constants
├── docker/              # Docker configurations
├── firebase.json        # Firebase configuration
├── firestore.rules      # Security rules
└── storage.rules        # Storage rules
```

## Emulator URLs

| Service | URL |
|---------|-----|
| Emulator UI | http://localhost:4000 |
| Functions | http://localhost:5001 |
| Firestore | http://localhost:8080 |
| Auth | http://localhost:9099 |
| Storage | http://localhost:9199 |

## Test Users (Development)

| Email | Password | Role |
|-------|----------|------|
| admin@ceslar.org | Admin123! | System Admin |
| pastor@ceslar.org | Pastor123! | Pastor |
| member@ceslar.org | Member123! | Member |

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Functions tests
cd functions && npm test

# Frontend tests
cd frontend && npm test

# Watch mode
cd frontend && npm run test:watch

# With coverage
cd frontend && npm run test:coverage
```

### Test Structure

```
functions/src/__tests__/          # Function unit tests
  ├── setup.js                    # Test setup
  └── utils/                      # Utility tests
      ├── response.utils.test.js
      └── pagination.utils.test.js

frontend/src/__tests__/           # Frontend tests
  ├── setup.js                    # Test setup (mocks)
  ├── test-utils.jsx              # Test utilities
  ├── store/                      # Redux slice tests
  │   └── auth.slice.test.js
  └── components/                 # Component tests
      └── Button.test.jsx
```

## Deployment

### Manual Deployment

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules,storage
```

### CI/CD Deployment

The project uses GitHub Actions for CI/CD:

1. **CI Workflow** (`.github/workflows/ci.yml`):
   - Runs on push to `main` and `develop`
   - Runs on pull requests
   - Lints and tests both functions and frontend
   - Builds frontend

2. **Deploy Workflow** (`.github/workflows/deploy.yml`):
   - Runs on push to `main`
   - Can be triggered manually
   - Deploys to Firebase Hosting and Functions

### Required Secrets

Configure these secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON |
| `FIREBASE_TOKEN` | Firebase CLI token |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_URL` | API URL (Cloud Functions) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |

## Architecture

### Frontend (Atomic Design)

```
components/
├── atoms/          # Basic UI elements (Button, Input, Typography)
├── molecules/      # Combinations of atoms (FormField, SearchInput)
├── organisms/      # Complex components (Header, Footer, DataTable)
├── templates/      # Page layouts (MainLayout, AdminLayout)
└── pages/          # Full pages with data fetching
    ├── public/     # Public pages
    ├── auth/       # Authentication pages
    ├── user/       # User pages
    └── admin/      # Admin pages
```

### State Management

- **Redux Toolkit**: Global app state
- **RTK Query**: Server state & caching
- **Redux Persist**: Auth & preferences persistence

### Authentication

- Firebase Auth with custom claims
- System roles: `system_admin`, `user`
- Church roles: `admin`, `pastor`, `leader`, `staff`, `member`, `visitor`

## Documentation

See `/firebase-migration/` folder for detailed documentation:
- `PROJECT-PLAN.md` - Migration timeline
- `ARCHITECTURE-DECISIONS.md` - Technical decisions
- `FIRESTORE-DATA-MODELS.md` - Database schema
- `ATOMIC-DESIGN-ARCHITECTURE.md` - Component architecture
- `REDUX-RTK-QUERY-GUIDE.md` - State management
- `SEEDERS-GUIDE.md` - Database seeding
- `DEVELOPMENT-GUIDE.md` - Development standards

## License

Private - Cristo Es La Respuesta
