/**
 * Seeder Configuration
 *
 * Central configuration for the seeding system.
 */

module.exports = {
  // Batch size for Firestore writes (max 500 per batch)
  BATCH_SIZE: 450,

  // Seeding order (dependencies respected)
  SEED_ORDER: [
    'questionCategories',
    'questions',
    'churches',
    'users',
    'events',
    'sermons',
    'ministries',
  ],

  // Clear order (reverse of seed order to respect foreign keys)
  CLEAR_ORDER: [
    'ministries',
    'sermons',
    'events',
    'users',
    'churches',
    'questions',
    'questionCategories',
  ],

  // Default passwords for test users
  DEFAULT_PASSWORD: 'Password123!',

  // Default preferences
  DEFAULT_PREFERENCES: {
    language: 'es',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
  },
};
