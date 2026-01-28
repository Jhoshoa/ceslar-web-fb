/**
 * Churches Seeder
 *
 * Seeds the church hierarchy:
 * headquarters → country → department → province → local
 */

const { FieldValue } = require('firebase-admin/firestore');
const churchesData = require('./data/churches.json');

const COLLECTION = 'churches';

/**
 * Seed churches collection with leadership subcollection data
 */
async function seedChurches(db, auth, options = {}) {
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

  for (const church of churchesData) {
    const docId = church.id;
    const churchDoc = {
      ...church,
      stats: {
        memberCount: 0,
        eventCount: 0,
        sermonCount: 0,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Remove id from document data (it's the doc ID)
    delete churchDoc.id;

    await collection.doc(docId).set(churchDoc);
    count++;
  }

  // Seed leadership for headquarters
  const hqRef = collection.doc('headquarters');
  await hqRef.collection('leadership').doc('pastor-principal').set({
    userId: null, // Will be linked after users are seeded
    displayName: 'Pastor Juan Perez',
    role: 'pastor',
    title: {
      es: 'Pastor Principal',
      en: 'Senior Pastor',
      pt: 'Pastor Principal',
    },
    order: 1,
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return count;
}

/**
 * Clear churches collection and subcollections
 */
async function clearChurches(db) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  let count = 0;

  for (const doc of snapshot.docs) {
    // Delete leadership subcollection
    const leadershipSnapshot = await doc.ref.collection('leadership').get();
    for (const leaderDoc of leadershipSnapshot.docs) {
      await leaderDoc.ref.delete();
    }

    // Delete members subcollection
    const membersSnapshot = await doc.ref.collection('members').get();
    for (const memberDoc of membersSnapshot.docs) {
      await memberDoc.ref.delete();
    }

    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedChurches, clearChurches };
