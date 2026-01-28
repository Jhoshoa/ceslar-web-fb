/**
 * Ministries Seeder
 *
 * Seeds ministry data with multilingual content and meeting schedules.
 */

const { FieldValue } = require('firebase-admin/firestore');
const ministriesData = require('./data/ministries.json');

const COLLECTION = 'ministries';

/**
 * Seed ministries collection
 */
async function seedMinistries(db, auth, options = {}) {
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

  for (const ministry of ministriesData) {
    const ministryDoc = {
      ...ministry,
      leaderId: null, // Will be linked after users are seeded if needed
      createdBy: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await collection.add(ministryDoc);
    count++;
  }

  return count;
}

/**
 * Clear ministries collection
 */
async function clearMinistries(db) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedMinistries, clearMinistries };
