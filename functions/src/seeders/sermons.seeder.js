/**
 * Sermons Seeder
 *
 * Seeds sermon data with multilingual content, categories, and tags.
 */

const { FieldValue } = require('firebase-admin/firestore');
const sermonsData = require('./data/sermons.json');

const COLLECTION = 'sermons';

/**
 * Seed sermons collection
 */
async function seedSermons(db, auth, options = {}) {
  const { force = false } = options;
  const collection = db.collection(COLLECTION);

  // Check if data already exists
  if (!force) {
    const snapshot = await collection.limit(1).get();
    if (!snapshot.empty) {
      console.log('(already exist, skipping)');
      return 0;
    }
  }

  let count = 0;

  for (const sermon of sermonsData) {
    const sermonDoc = {
      ...sermon,
      speakerId: null, // Will be linked after users are seeded if needed
      createdBy: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await collection.add(sermonDoc);
    count++;
  }

  return count;
}

/**
 * Clear sermons collection
 */
async function clearSermons(db) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedSermons, clearSermons };
