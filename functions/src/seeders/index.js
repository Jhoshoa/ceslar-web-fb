/**
 * Master Seeder - Entry Point
 *
 * Orchestrates database seeding for the Cristo Es La Respuesta platform.
 * Supports CLI arguments for selective seeding, force mode, and clearing.
 *
 * Usage:
 *   node src/seeders/index.js              # Seed all (skip existing)
 *   node src/seeders/index.js --force      # Clear and reseed all
 *   node src/seeders/index.js --clear      # Clear all data
 *   node src/seeders/index.js churches     # Seed only churches
 *   node src/seeders/index.js users events # Seed specific collections
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin (uses emulators if FIRESTORE_EMULATOR_HOST is set)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'ceslar-church-platform',
  });
}

const db = getFirestore();
const auth = getAuth();

// Import seeders
const { seedChurches, clearChurches } = require('./churches.seeder');
const { seedUsers, clearUsers } = require('./users.seeder');
const { seedEvents, clearEvents } = require('./events.seeder');
const { seedSermons, clearSermons } = require('./sermons.seeder');
const { seedMinistries, clearMinistries } = require('./ministries.seeder');
const { seedQuestions, clearQuestions } = require('./questions.seeder');

/**
 * Available seeders in execution order
 */
const seeders = [
  { name: 'questionCategories', seed: seedQuestions, clear: clearQuestions },
  { name: 'questions', seed: seedQuestions, clear: clearQuestions },
  { name: 'churches', seed: seedChurches, clear: clearChurches },
  { name: 'users', seed: seedUsers, clear: clearUsers },
  { name: 'events', seed: seedEvents, clear: clearEvents },
  { name: 'sermons', seed: seedSermons, clear: clearSermons },
  { name: 'ministries', seed: seedMinistries, clear: clearMinistries },
];

// Deduplicate seeders that share the same seed function (questions + questionCategories)
function getUniqueSeeders(filteredSeeders) {
  const seen = new Set();
  return filteredSeeders.filter((s) => {
    if (seen.has(s.seed)) return false;
    seen.add(s.seed);
    return true;
  });
}

/**
 * Main seeder function
 *
 * @param {Object} options
 * @param {boolean} options.force - Clear existing data before seeding
 * @param {boolean} options.clear - Only clear data, don't seed
 * @param {string[]} options.only - Only seed these collections
 */
async function runSeeders(options = {}) {
  const { force = false, clear = false, only = [] } = options;

  console.log('');
  console.log('========================================');
  console.log('  CESLAR - FIRESTORE SEEDER');
  console.log('========================================');
  console.log(`  Mode:        ${clear ? 'CLEAR ONLY' : force ? 'FORCE RESEED' : 'SEED (skip existing)'}`);
  console.log(`  Collections: ${only.length ? only.join(', ') : 'all'}`);
  console.log(`  Emulator:    ${process.env.FIRESTORE_EMULATOR_HOST || 'NOT SET (production!)'}`);
  console.log('========================================');
  console.log('');

  // Safety check: warn if not using emulators
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn('WARNING: FIRESTORE_EMULATOR_HOST is not set.');
    console.warn('You may be seeding PRODUCTION data. Press Ctrl+C to abort.');
    console.warn('Continuing in 3 seconds...\n');
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Filter seeders if 'only' is specified
  const filteredSeeders = only.length ?
    seeders.filter((s) => only.includes(s.name)) :
    seeders;

  const uniqueSeeders = getUniqueSeeders(filteredSeeders);

  try {
    // Clear phase
    if (force || clear) {
      console.log('--- CLEARING DATA ---\n');
      const reversedSeeders = [...uniqueSeeders].reverse();
      for (const seeder of reversedSeeders) {
        process.stdout.write(`  Clearing ${seeder.name}... `);
        const count = await seeder.clear(db, auth);
        console.log(`done (${count || 0} removed)`);
      }
      console.log('');
    }

    // Seed phase
    if (!clear) {
      console.log('--- SEEDING DATA ---\n');
      for (const seeder of uniqueSeeders) {
        process.stdout.write(`  Seeding ${seeder.name}... `);
        const count = await seeder.seed(db, auth, { force });
        console.log(`done (${count} documents)`);
      }
      console.log('');
    }

    console.log('========================================');
    console.log('  SEEDING COMPLETE');
    console.log('========================================\n');
  } catch (error) {
    console.error('\nSeeding failed:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// CLI Support
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force') || args.includes('-f'),
    clear: args.includes('--clear') || args.includes('-c'),
    only: args.filter((arg) => !arg.startsWith('-')).filter(Boolean),
  };

  runSeeders(options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runSeeders };
