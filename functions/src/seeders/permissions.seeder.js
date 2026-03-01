/**
 * Permissions Seeder
 *
 * Seeds the permissions collection with all available permissions.
 * These permissions are used by the role management system.
 */

const { FieldValue } = require('firebase-admin/firestore');
const permissionsData = require('./data/permissions.json');

const COLLECTION = 'permissions';

/**
 * Seed permissions in Firestore
 */
async function seedPermissions(db, auth, options = {}) {
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

  for (const permission of permissionsData) {
    const docRef = collection.doc(permission.id);
    batch.set(docRef, {
      ...permission,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Clear permissions from Firestore
 */
async function clearPermissions(db) {
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

module.exports = { seedPermissions, clearPermissions };
