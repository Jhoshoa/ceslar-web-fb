# CESLAR Firebase Functions

Backend Cloud Functions for the Cristo Es La Respuesta platform.

## Prerequisites

- Node.js 20
- Firebase CLI (`npm install -g firebase-tools`)
- Docker (optional, for emulators)

## Setup

```bash
cd functions
npm install
```

## Seeding Data

The seeding system populates the Firestore emulator with test data for development.

### Why Seeding Fails

The seed commands require environment variables to connect to the Firebase Emulators. Without them, the script tries to connect to production Firebase and fails with authentication errors.

### Option 1: Seed from Host Machine (Recommended)

With Docker emulators running, set the environment variables and run:

**Windows (PowerShell):**
```powershell
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
npm run seed
```

**Windows (Git Bash / MINGW):**
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run seed
```

**Linux/macOS:**
```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run seed
```

### Option 2: Seed from Inside Docker Container

```bash
docker-compose exec firebase-emulators npm run seed --prefix functions
```

### Available Seed Commands

| Command | Description |
|---------|-------------|
| `npm run seed` | Seed all collections (skips existing data) |
| `npm run seed:force` | Clear all data and reseed fresh |
| `npm run seed:clear` | Clear all seeded data without reseeding |
| `npm run seed:churches` | Seed only churches |
| `npm run seed:users` | Seed only users |
| `npm run seed:events` | Seed only events |
| `npm run seed:sermons` | Seed only sermons |
| `npm run seed:questions` | Seed questions and categories |

### Force Reseed After Data Loss

If emulator data is lost (PC shutdown, container restart, etc.):

```bash
# From host machine (Git Bash)
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run seed:force

# Or from inside Docker
docker-compose exec firebase-emulators npm run seed:force --prefix functions
```

## Data Persistence

### Why Data Gets Lost

Firebase Emulator data is stored in memory by default. The docker-compose.yml configures persistence:

```yaml
command: >
  firebase emulators:start
  --import=/app/emulator-data
  --export-on-exit=/app/emulator-data
```

Data is exported when the container stops **gracefully**. If Docker or your PC shuts down abruptly, data may not be saved.

### Ensuring Data Persistence

1. **Stop containers gracefully:**
   ```bash
   docker-compose down
   ```
   Avoid forcefully killing Docker or shutting down your PC while containers are running.

2. **Manual export (before shutdown):**
   ```bash
   docker-compose exec firebase-emulators firebase emulators:export /app/emulator-data --force
   ```

3. **Check if data exists:**
   ```bash
   ls -la emulator-data/
   ```
   You should see `firestore_export/` and `auth_export/` directories.

### Quick Recovery After Data Loss

```bash
# 1. Make sure emulators are running
docker-compose up -d firebase-emulators

# 2. Wait a few seconds for emulators to start
sleep 5

# 3. Seed the data (from Git Bash)
cd functions
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run seed:force
```

## Test Users

After seeding, these test accounts are available:

| Email | Password | Role |
|-------|----------|------|
| admin@ceslar.org | Admin123! | system_admin |
| pastor@ceslar.org | Pastor123! | pastor (headquarters) |
| leader@ceslar.org | Leader123! | leader |
| member@ceslar.org | Member123! | member |
| visitor@ceslar.org | Visitor123! | visitor |

## Other Commands

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run test          # Run tests
npm run deploy        # Deploy to Firebase
npm run logs          # View function logs
```

## Emulator Ports

| Service | Port |
|---------|------|
| Emulator UI | 4000 |
| Functions | 5001 |
| Firestore | 8080 |
| Auth | 9099 |
| Storage | 9199 |
| Pub/Sub | 8085 |

## Troubleshooting

### "Could not load the default credentials"

You're missing the emulator environment variables. Make sure to set:
- `FIRESTORE_EMULATOR_HOST=localhost:8080`
- `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`

### "Connection refused" errors

The emulators aren't running. Start them with:
```bash
docker-compose up -d firebase-emulators
```

### Seed completes but no data appears

1. Verify emulators are running: http://localhost:4000
2. Check you're connecting to the right ports
3. Try `npm run seed:force` to clear and reseed
