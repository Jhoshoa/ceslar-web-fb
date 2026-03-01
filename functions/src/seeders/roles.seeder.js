/**
 * Roles Seeder
 *
 * Seeds the roles collection with default system and church roles.
 * These roles define permission sets that can be assigned to users.
 */

const { FieldValue } = require('firebase-admin/firestore');
const rolesData = require('./data/roles.json');

const COLLECTION = 'roles';

/**
 * Seed roles in Firestore
 */
async function seedRoles(db, auth, options = {}) {
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

  // Use batched writes for efficiency
  const batch = db.batch();
  let count = 0;

  for (const role of rolesData) {
    const docRef = collection.doc(role.id);
    batch.set(docRef, {
      ...role,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'system',
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Clear roles from Firestore
 */
async function clearRoles(db) {
  const collection = db.collection(COLLECTION);
  const snapshot = await collection.get();

  if (snapshot.empty) {
    return 0;
  }

  // Use batched deletes for efficiency
  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    count++;
  }

  await batch.commit();
  return count;
}

module.exports = { seedRoles, clearRoles };
