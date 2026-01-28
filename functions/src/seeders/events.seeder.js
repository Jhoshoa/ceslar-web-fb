/**
 * Events Seeder
 *
 * Seeds event data with multilingual content and registration info.
 */

const { FieldValue } = require('firebase-admin/firestore');
const eventsData = require('./data/events.json');

const COLLECTION = 'events';

/**
 * Seed events collection
 */
async function seedEvents(db, auth, options = {}) {
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

  for (const event of eventsData) {
    const eventDoc = {
      ...event,
      createdBy: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await collection.add(eventDoc);
    count++;
  }

  return count;
}

/**
 * Clear events collection and registration subcollections
 */
async function clearEvents(db) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    // Delete registrations subcollection
    const registrationsSnapshot = await doc.ref.collection('registrations').get();
    for (const regDoc of registrationsSnapshot.docs) {
      await regDoc.ref.delete();
    }

    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedEvents, clearEvents };
